terraform {
  required_providers {
    aws = {
      source                = "hashicorp/aws"
      version               = "~> 5.86.0"
    }
  }
  required_version = ">= 1.1.0"
}

terraform {
  backend "s3" {
    bucket  = "digiinflunecer-tf-state"
    key     = "terraform.tfstate"
    region  = "ap-south-1"
    encrypt = true
    profile = "aws-digi"
  }
}