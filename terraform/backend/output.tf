output "load_balancer_dns" {
  value = aws_lb.backend.dns_name
  description = "DNS name of the backend load balancer"
}