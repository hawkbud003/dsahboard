output "frontend_url" {
  description = "URL to access the deployed container"
  value       = "http://${aws_lb.frontend.dns_name}"
}