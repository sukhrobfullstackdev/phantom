resource "cloudflare_record" "app" {
  for_each = toset(local.app_fqdns)

  zone_id = local.rs_magic_cloudflare.magic_link_zone.id
  name    = each.value
  value   = local.app_dns_target
  type    = "CNAME"
  ttl     = local.app_dns_ttl
  proxied = local.app_dns_proxied

  allow_overwrite = false # Not recommended to change, should be false
}

# TODO(mack#sc67151|2022-12-29): This resource will be gone when we stop using Cloudfront
resource "cloudflare_record" "app_assets" {
  for_each = toset(formatlist("assets.%s", local.app_fqdns))

  zone_id = local.rs_magic_cloudflare.magic_link_zone.id
  name    = each.value
  value   = local.app_assets_dns_target[each.value]
  type    = "CNAME"
  ttl     = local.app_assets_dns_ttl
  proxied = local.app_assets_dns_proxied

  allow_overwrite = false # Not recommended to change, should be false
}
