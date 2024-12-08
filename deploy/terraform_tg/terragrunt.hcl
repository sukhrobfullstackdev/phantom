locals {
  env_vars   = read_terragrunt_config(find_in_parent_folders("env.hcl"))
  env_group  = local.env_vars.locals.env_group
  deploy_env = split("/", path_relative_to_include())[0]
  region     = split("/", path_relative_to_include())[1]

  name = "auth-${local.deploy_env}"
  tags = {
    part_of    = local.name
    deploy_env = local.deploy_env
    region     = local.region
  }
}

inputs = {
  name       = local.name
  region     = local.region
  env_group  = local.env_group
  deploy_env = local.deploy_env

  tags   = local.tags
  labels = local.tags
}

remote_state {
  backend = "s3"
  generate = {
    path      = "state_config.tf"
    if_exists = "overwrite_terragrunt"
  }
  config = {
    encrypt        = true
    kms_key_id     = "arn:aws:kms:us-west-2:971106922139:alias/aws/s3"
    profile        = "Management/StateManagement"
    region         = "us-west-2"
    dynamodb_table = "ftmt-tf-locks"
    bucket         = "ftmt-tf-state"

    workspace_key_prefix = "workspace"
    key                  = "magic_apps/${local.name}/${path_relative_to_include()}/terraform.tfstate"
  }
}
