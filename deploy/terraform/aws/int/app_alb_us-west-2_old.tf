resource "aws_lb_listener_rule" "app_us-west-2" {
  provider = aws.us-west-2

  listener_arn = local.rs_magic_aws_core_regional.us-west-2.alb.cloudflare.https_listener_arn

  action {
    type             = "forward"
    target_group_arn = data.aws_lb_target_group.eks_a_ngxinc_pub.arn
  }

  condition {
    host_header {
      values = flatten([for deploy_env in local.app : [for fqdn in deploy_env.fqdns : fqdn]])
    }
  }

  tags = merge(local.regional_tags.us-west-2, {
    Name = "magic-${local.env_group}-${var.app_name}"
    role = "auth"
  })
}

resource "aws_lb_listener_rule" "app_partners_us-west-2" {
  provider = aws.us-west-2

  listener_arn = local.rs_magic_aws_core_regional.us-west-2.alb.cloudflare.https_listener_arn

  action {
    type             = "forward"
    target_group_arn = data.aws_lb_target_group.eks_a_ngxinc_pub.arn
  }

  condition {
    host_header {
      values = ["auth.*", "walletconnect.*", "legacy.*"]
    }
  }

  tags = merge(local.regional_tags.us-west-2, {
    "Name" = "${local.naming.name_prefix}-${var.app_name}"
  })
}
