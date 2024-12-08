locals {
  app = { for deploy_env in local.naming.deploy_envs :
    deploy_env => {
      name          = "${var.app_name}-${deploy_env}"
      iam_role_name = "eks-${var.app_name}-${deploy_env}"
      fqdns = [
        # We remove `.prod.` since there should be no env name in live (prod)
        replace("auth.${deploy_env}.magic.link", ".prod.", ".")
      ]
    }
  }
}
