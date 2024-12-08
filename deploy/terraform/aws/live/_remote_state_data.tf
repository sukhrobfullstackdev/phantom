data "terraform_remote_state" "magic_aws_core_global" {
  backend = "s3"

  config = {
    encrypt    = true
    kms_key_id = "arn:aws:kms:us-west-2:971106922139:alias/aws/s3"
    profile    = "Management/StateManagement"
    region     = "us-west-2"
    bucket     = "ftmt-tf-state"
    key        = "magic/aws_core/${local.env_group}/global/terraform.tfstate"
  }
}

data "terraform_remote_state" "magic_aws_core_regional" {
  for_each = toset(["us-west-2"])
  backend  = "s3"

  config = {
    encrypt    = true
    kms_key_id = "arn:aws:kms:us-west-2:971106922139:alias/aws/s3"
    profile    = "Management/StateManagement"
    region     = "us-west-2"
    bucket     = "ftmt-tf-state"
    key        = "magic/aws_core/${local.env_group}/${each.value}/terraform.tfstate"
  }
}

locals {
  rs_magic_aws_core_global   = data.terraform_remote_state.magic_aws_core_global.outputs
  rs_magic_aws_core_regional = { for k, v in data.terraform_remote_state.magic_aws_core_regional : k => v.outputs }

  naming = local.rs_magic_aws_core_global.naming
}
