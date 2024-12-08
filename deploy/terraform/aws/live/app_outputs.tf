output "app_global" {
  value = { for deploy_env, app in local.app :
    deploy_env => {
      deploy_env = deploy_env
      name       = local.app[deploy_env].name
      iam = {
        name = module.app_iam[deploy_env].iam_role_name
        arn  = module.app_iam[deploy_env].iam_role_arn
      }
      fqdns = local.app[deploy_env].fqdns
    }
  }
}

output "app_global_extra" {
  value = { for deploy_env, app in local.app :
    deploy_env => {
      fqdns = local.partner_domains
    }
  }
}

output "app_regional" {
  value = {
    us-west-2 = {
      alb = {
        name     = local.rs_magic_aws_core_regional.us-west-2.alb.cloudflare.lb.name
        arn      = local.rs_magic_aws_core_regional.us-west-2.alb.cloudflare.lb.arn
        dns_name = local.rs_magic_aws_core_regional.us-west-2.alb.cloudflare.lb.dns_name
      }
    }
  }
}
