provider "aws" {
  profile = var.aws_profile
  region  = var.region
}

provider "aws" {
  alias   = "us"
  profile = var.aws_profile
  region  = "ap-south-1"
}