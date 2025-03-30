variable "region" {
  description = "AWS region"
  type        = string
  default     = "ap-south-1"
}

variable "aws_profile" {
  description = "Name of your AWS profile"
  type        = string
  default     = "aws-digi"
}
variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "application_name" {
  description = "Name of the application"
  type        = string
  default     = "dsp-backend"
}

variable "vpc_id" {
  description = "Name of the VPC"
  type        = string
  default     = "vpc-0ef001568d0c7d434"
}

variable "subnets" {
  description = "Name of the VPC"
  type        = list
  default     = [
  "subnet-07bf022ab49516c88",  
  "subnet-05f8794d2289461a4",
  "subnet-0ef26d920583352d9"
]
}

variable "backend_url" {
  description = "Backend API URL"
  type        = string
}