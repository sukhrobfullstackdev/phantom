locals {
  api_token = (var.api_token == null ? yamldecode(file(pathexpand("~/.cloudflare/credentials.yaml"))).api_token : var.api_token)
  env_group = basename(path.cwd) # Take env group from the path like ....foo/bar/${ENV_GROUP}/us-west-2

  app_fqdns = flatten([for k, v in local.rs_magic_app.app_global : [for fqdn in v.fqdns : fqdn]])
  app_alb   = local.rs_magic_app.app_regional.us-west-2.alb.dns_name
  /*
    Int envs should always be pointed to the Zero Trust tunnel (VPN component), otherwise requests won't go through.
    Exception: Load testing, we should bypass Zero Trust tunnel for load testing.
      Use `loca.app_alb` for `app_dns_target` value to do load testing
      Set:
       app_dns_ttl     = 300
       app_dns_proxied = true
  */
  app_dns_target  = local.rs_magic_cloudflare_zero_trust.zero_trust_tunnel.us-west-2.cname
  app_dns_ttl     = 1
  app_dns_proxied = true
  # TODO(mack#sc67151|2022-12-29): `app_assets_dns_target` will be gone when we stop using Cloudfront
  app_assets_dns_target  = { "assets.auth.dev.magic.link" = "d3f6670fs05v1p.cloudfront.net", "assets.auth.stagef.magic.link" = "d1rvxo00mo7rg2.cloudfront.net" }
  app_assets_dns_ttl     = 1
  app_assets_dns_proxied = true
}
