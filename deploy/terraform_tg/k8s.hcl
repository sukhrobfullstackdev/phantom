terraform {
  source = "git@github.com:magiclabs/tf-module-k8s-app-deps?ref=v0.1.3"
}

# Generate provider because used module don't have it
generate "provider" {
  path      = "provider.tf"
  if_exists = "overwrite"
  contents  = <<-EOT
    provider "kubernetes" {
      host                   = "${local.env_vars.locals.eks_cluster.cluster_endpoint}"
      cluster_ca_certificate = base64decode("${local.env_vars.locals.eks_cluster.cluster_certificate_authority_data}")

      exec {
        api_version = "client.authentication.k8s.io/v1beta1"
        command     = "aws"
        args        = ["--profile", "${local.aws_profile}", "eks", "get-token", "--cluster-name", "${local.env_vars.locals.eks_cluster.cluster_name}"]
      }
    }
  EOT
}

locals {
  env_vars    = read_terragrunt_config(find_in_parent_folders("env.hcl"))
  env_group   = local.env_vars.locals.env_group
  deploy_env  = split("/", path_relative_to_include())[0]
  aws_profile = local.env_vars.locals.aws_profile
}

inputs = {
  aws_profile = "${local.aws_profile}"
  namespace   = local.deploy_env
  hpa         = try(local.env_vars.locals.hpa, {})

  service = {
    port = 3014
  }

  ing_nginxinc_pub = {
    enabled = true
    fqdns = concat(
      [replace("auth.${local.deploy_env}.magic.link", ".prod", "")],
      local.env_vars.locals.partner_domains,
    )
  }
}
