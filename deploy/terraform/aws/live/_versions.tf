terraform {
  required_version = ">= 1.3.2" # terraform

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.84" # aws
    }
  }
}
