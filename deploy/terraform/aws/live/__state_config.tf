terraform {
  backend "s3" {
    encrypt        = true
    kms_key_id     = "arn:aws:kms:us-west-2:971106922139:alias/aws/s3"
    profile        = "Management/StateManagement"
    region         = "us-west-2"
    dynamodb_table = "ftmt-tf-locks"
    bucket         = "ftmt-tf-state"

    workspace_key_prefix = "workspace"
    key                  = "magic_apps/auth/aws/live/terraform.tfstate"
  }
}
