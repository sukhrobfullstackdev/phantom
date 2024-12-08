module "app_iam" {
  source    = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version   = "~> 5.5"
  providers = { aws = aws.us-east-1 }
  for_each  = local.app

  role_name             = each.value.iam_role_name
  role_description      = "Role to be used by ${each.value.name} K8s Service Account"
  force_detach_policies = true

  oidc_providers = { for k, v in data.aws_iam_openid_connect_provider.this_eks : k => {
    provider_arn               = v.arn
    namespace_service_accounts = ["${each.key}:${each.value.iam_role_name}"]
    }
  }

  tags = local.naming.global_tags
}
