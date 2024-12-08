data "terraform_remote_state" "magic_cloudflare" {
  backend = "s3"

  config = {
    encrypt    = true
    kms_key_id = "arn:aws:kms:us-west-2:971106922139:alias/aws/s3"
    profile    = "Management/StateManagement"
    region     = "us-west-2"
    bucket     = "ftmt-tf-state"
    key        = "ops/cloudflare/terraform.tfstate"
  }
}

data "terraform_remote_state" "magic_cloudflare_zero_trust" {
  backend = "s3"

  config = {
    encrypt    = true
    kms_key_id = "arn:aws:kms:us-west-2:971106922139:alias/aws/s3"
    profile    = "Management/StateManagement"
    region     = "us-west-2"
    bucket     = "ftmt-tf-state"
    key        = "ops/cloudflare-zero-trust/terraform.tfstate"
  }
}

data "terraform_remote_state" "magic_app" {
  backend = "s3"

  config = {
    encrypt    = true
    kms_key_id = "arn:aws:kms:us-west-2:971106922139:alias/aws/s3"
    profile    = "Management/StateManagement"
    region     = "us-west-2"
    bucket     = "ftmt-tf-state"
    key        = "magic_apps/auth/aws/${local.env_group}/terraform.tfstate"
  }
}

locals {
  rs_magic_cloudflare            = data.terraform_remote_state.magic_cloudflare.outputs
  rs_magic_cloudflare_zero_trust = data.terraform_remote_state.magic_cloudflare_zero_trust.outputs
  rs_magic_app                   = data.terraform_remote_state.magic_app.outputs
}
