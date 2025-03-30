

resource "aws_security_group" "backend" {
  name        = "backend-sg"
  description = "Security group for backend ECS service"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 3306
    to_port     = 3306
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
    description = "Allow backendmmr traffic"
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

resource "aws_ecr_repository" "backend" {
  name                 = "backend"
  image_tag_mutability = "MUTABLE"
  force_delete         = true
}

resource "null_resource" "Backend_build" {
  triggers = {
     always_run = timestamp()
  }

  provisioner "local-exec" {
    command = "DOCKER_DEFAULT_PLATFORM='linux/amd64' docker build -t ${aws_ecr_repository.backend.repository_url}:latest -f ../backend/Dockerfile ../backend"
  }

  provisioner "local-exec" {
    command = "aws ecr get-login-password --region ${var.region} --profile ${var.aws_profile} | docker login --username AWS --password-stdin ${aws_ecr_repository.backend.repository_url}"
  }

  provisioner "local-exec" {
    command = "docker push ${aws_ecr_repository.backend.repository_url}:latest"
  }

}

resource "aws_cloudwatch_log_group" "backend" {
  name = "backend"
}

resource "aws_ecs_cluster" "backend" {
  name = "backend"
}

resource "aws_iam_role" "backend" {
  name = "backend-ecs-role"
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
    Name = "backend-ecs-role"
    Environment = var.environment
  }

}

resource "aws_iam_role_policy_attachment" "backend_ecr_policy" {
  role       = aws_iam_role.backend.name
  policy_arn = aws_iam_policy.ecr_policy.arn
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_policy_attachment" {
  role       = aws_iam_role.backend.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
  
  depends_on = [
    aws_iam_role.backend
  ]
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_policy_attachment_backend" {
  role       = aws_iam_role.backend.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
  
  depends_on = [
    aws_iam_role.backend
  ]
}

resource "aws_ecs_task_definition" "backend" {
  family                   = "backend"
  execution_role_arn       = aws_iam_role.backend.arn
  cpu                      = "1024"
  memory                   = "2048"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]

  container_definitions = jsonencode([{
    name      = "backend"
    image     = "${aws_ecr_repository.backend.repository_url}:latest"
    cpu       = 1024
    memory    = 2048
    essential = true
    portMappings = [{
      containerPort = 80
      hostPort      = 80
      protocol      = "tcp"
    }]
    logConfiguration = {
      logDriver = "awslogs",
      options = {
        awslogs-group         = aws_cloudwatch_log_group.backend.name,
        awslogs-region        = var.region,
        awslogs-stream-prefix = "ecs"
      }
    }
  }])
}

resource "aws_ecs_service" "backend" {
  name                 = "backend"
  cluster              = aws_ecs_cluster.backend.id
  task_definition      = aws_ecs_task_definition.backend.arn
  desired_count        = 1
  launch_type          = "FARGATE"
  force_new_deployment = true

  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "backend"
    container_port   = 80
  }
  network_configuration {
    subnets          = var.subnets
    security_groups  = [aws_security_group.backend.id]
    assign_public_ip = true
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_lb" "backend" {
  name                       = "backend-lb"
  internal                   = false
  load_balancer_type         = "application"
  security_groups            = [aws_security_group.backend.id]
  subnets                    = var.subnets
  enable_deletion_protection = false
}

resource "aws_lb_target_group" "backend" {
  name        = "backend-tg"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    path                = "/"
    protocol            = "HTTP"
    matcher             = "200-299"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 3
    unhealthy_threshold = 3
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.backend.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }
}

# Create an IAM policy for ECR access
resource "aws_iam_policy" "ecr_policy" {
  name = "backend-ecr-access-policy"
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