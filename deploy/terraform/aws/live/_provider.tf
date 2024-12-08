# For Region independent resources. Such as r53, IAM
provider "aws" {
  region  = "us-east-1"
  alias   = "us-east-1"
  profile = local.aws_profile
}

# Regionbal resources
provider "aws" {
  region  = "us-west-2"
  alias   = "us-west-2"
  profile = local.aws_profile
}
