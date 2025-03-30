resource "random_string" "target_group_suffix" {
  length  = 4
  special = false
  upper   = false
}

resource "aws_security_group" "frontend" {
  name        = "frontend-sg"
  description = "Security group for frontend ECS service"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    description = "Allow HTTPS traffic"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
  from_port   = 3000
  to_port     = 3000
  protocol    = "tcp"
  cidr_blocks = ["0.0.0.0/0"]
}
  ingress {
    description = "Allow frontend traffic"
    from_port   = 587
    to_port     = 587
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"  # All traffic
    cidr_blocks = ["0.0.0.0/0"]
  }
}


resource "aws_ecr_repository" "frontend" {
  name                 = "frontend"
  image_tag_mutability = "MUTABLE"
  force_delete         = true
}

resource "null_resource" "Frontend_build" {
  triggers = {
    always_run = timestamp()
  }

  provisioner "local-exec" {
    command = <<-EOT
      # First, remove existing credentials
      echo "🔄 Cleaning up existing credentials..."
      security delete-generic-password -l "docker-credential-desktop" || true
      docker logout ${aws_ecr_repository.frontend.repository_url} || true
      
      # Build the image with build logs
      echo "🏗️ Building Docker image..."
      DOCKER_BUILDKIT=1 DOCKER_DEFAULT_PLATFORM='linux/amd64' docker build \
        --progress=plain \
        --no-cache \
        -t ${aws_ecr_repository.frontend.repository_url}:latest \
        -f ../frontend/Dockerfile ../frontend 2>&1 | tee /tmp/docker-build.log
      
      # Check if build was successful
      if [ $? -ne 0 ]; then
        echo "❌ Docker build failed. Check the logs above."
        exit 1
      fi
      
      # Login to ECR with error handling
      echo "🔑 Logging into ECR..."
      aws ecr get-login-password --region ${var.region} --profile ${var.aws_profile} | \
      docker login --username AWS --password-stdin ${aws_ecr_repository.frontend.repository_url} || \
      (echo "❌ ECR login failed" && exit 1)
      
      # Push the image with progress
      echo "📤 Pushing image to ECR..."
      docker push ${aws_ecr_repository.frontend.repository_url}:latest 2>&1 | tee /tmp/docker-push.log
      
      echo "✅ Build and push completed successfully!"
    EOT
  }

  # Add provisioner to show build logs on failure
  provisioner "local-exec" {
    when    = destroy
    command = "rm -f /tmp/docker-build.log /tmp/docker-push.log"
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_cloudwatch_log_group" "frontend" {
  name = "frontend"
}

resource "aws_ecs_cluster" "frontend" {
  name = "frontend"
}

resource "aws_iam_role" "frontend" {
  name = "frontend-ecs-role"
  path = "/"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      }
    }]
  })

  tags = {
    Name = "frontend-ecs-role"
    Environment = var.environment
  }

}


resource "aws_iam_role_policy_attachment" "frontend_ecr_policy" {
  role       = aws_iam_role.frontend.name
  policy_arn = aws_iam_policy.ecr_policy.arn
}


resource "aws_iam_role_policy_attachment" "ecs_task_execution_policy_attachment_frontend" {
  role       = aws_iam_role.frontend.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
  
  depends_on = [
    aws_iam_role.frontend
  ]
}



resource "aws_ecs_task_definition" "frontend" {
  family                   = "frontend"
  execution_role_arn       = aws_iam_role.frontend.arn
  cpu                      = "1024"
  memory                   = "2048"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]

  container_definitions = jsonencode([{
    name      = "frontend"
    image     = "${aws_ecr_repository.frontend.repository_url}:latest"
    cpu       = 1024
    memory    = 2048
    essential = true
    environment = [
      {
        name  = "NEXT_PUBLIC_API_BASE_URL"
        value = "http://${var.backend_url}"
      }
    ]
    portMappings = [{
      containerPort = 3000
      protocol      = "tcp"
    }]
    logConfiguration = {
      logDriver = "awslogs",
      options = {
        awslogs-group         = aws_cloudwatch_log_group.frontend.name,
        awslogs-region        = var.region,
        awslogs-stream-prefix = "ecs"
      }
    }
  }])
}

# ECS Service to run the task

resource "aws_ecs_service" "frontend" {
  name                 = "frontend"
  cluster              = aws_ecs_cluster.frontend.id
  task_definition      = aws_ecs_task_definition.frontend.arn
  desired_count        = 1
  launch_type          = "FARGATE"
  force_new_deployment = true
  
  load_balancer {
    target_group_arn = aws_lb_target_group.frontend.arn
    container_name   = "frontend"
    container_port   = 3000
  }
  network_configuration {
    subnets          = var.subnets
    security_groups  = [aws_security_group.frontend.id]
    assign_public_ip = true
  }

  lifecycle {
    create_before_destroy = true
  }
}


resource "aws_lb" "frontend" {
  name                       = "frontend-lb"
  internal                   = false
  load_balancer_type         = "application"
  security_groups            = [aws_security_group.frontend.id]
  subnets                    = var.subnets
  enable_deletion_protection = false
}


resource "aws_lb_target_group" "frontend" {
  name        = "frontend-tg"
  port        = 3000  # Changed to 3000 to match container port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    path                = "/api/health"
    protocol            = "HTTP"
    port                = "traffic-port"  # Use the same port as target group
    matcher             = "200-399"
    interval            = 60
    timeout             = 30
    healthy_threshold   = 2
    unhealthy_threshold = 5
  }

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name        = "frontend-tg"
    Environment = var.environment
  }
}


# Load balancer listener remains on port 80
resource "aws_lb_listener" "frontend" {
  load_balancer_arn = aws_lb.frontend.arn
  port              = 80  # External port remains 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend.arn
  }
}

resource "aws_iam_policy" "ecr_policy" {
  name = "frontend-ecr-access-policy"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage"
        ]
        Resource = "*"
      }
    ]
  })
}


resource "aws_iam_policy" "terraform_state" {
  name = "terraform-state-access"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:ListBucket",
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = [
          "arn:aws:s3:::digiinflunecer-tf-state",
          "arn:aws:s3:::digiinflunecer-tf-state/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:DeleteItem"
        ]
        Resource = "arn:aws:dynamodb:*:*:table/terraform-lock"
      }
    ]
  })
}