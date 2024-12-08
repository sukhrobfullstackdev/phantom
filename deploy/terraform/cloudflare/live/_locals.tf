locals {
  api_token = (var.api_token == null ? yamldecode(file(pathexpand("~/.cloudflare/credentials.yaml"))).api_token : var.api_token)
  env_group = basename(path.cwd) # Take env group from the path like ....foo/bar/${ENV_GROUP}/us-west-2

  app_fqdns                  = flatten([for k, v in local.rs_magic_app.app_global : [for fqdn in v.fqdns : fqdn]])
  app_alb                    = local.rs_magic_app.app_regional.us-west-2.alb.dns_name
  app_dns_target             = local.app_alb
  app_dns_ttl                = 1
  app_dns_proxied            = true
  app_rate_limit_domain_blob = "auth.*"
  # TODO(mack#sc67151|2022-12-29): `app_assets_dns_target` will be gone when we stop using Cloudfront
  app_assets_dns_target  = { "assets.auth.magic.link" = "d1nio8jhji2fqt.cloudfront.net" }
  app_assets_dns_ttl     = 300
  app_assets_dns_proxied = false
}
