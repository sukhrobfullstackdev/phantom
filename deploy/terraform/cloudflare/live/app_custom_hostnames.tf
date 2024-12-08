resource "cloudflare_record" "app_partner" {
  zone_id = local.rs_magic_cloudflare.magic_link_zone.id
  name    = "partner-auth.magic.link"
  value   = local.app_dns_target
  type    = "CNAME"
  ttl     = 1
  proxied = true

  allow_overwrite = false # Not recommended to change, should be false
}

resource "cloudflare_custom_hostname_fallback_origin" "app" {
  zone_id = local.rs_magic_cloudflare.magic_link_zone.id
  origin  = cloudflare_record.app_partner.name
}

module "app_partners" {
  # NOTE: We use master for module versions for now, we may switch to tags in future
  # tflint-ignore: terraform_module_pinned_source
  source   = "git@github.com:magiclabs/infrastructure.git//tf_modules/cloudflare/custom_hostname?ref=master"
  for_each = toset(local.rs_magic_app.app_global_extra.prod.fqdns)

  zone_id  = local.rs_magic_cloudflare.magic_link_zone.id
  hostname = each.value

  # use http validation with lets_encrypt. cloudflare will automatically
  # respond to the http request for us as long as it's not blocked by WAF.
  certificate_authority = "lets_encrypt"
  ssl_validation_method = "http"

  custom_origin = {
    target = cloudflare_record.app_partner.name
    suffix = cloudflare_record.app_partner.name
    sni    = one(values(cloudflare_record.app)).name
  }

  # Page rules should be same to what app_page_rules has
  page_rules = {
    "/*" = local.page_rules
  }

  depends_on = [
    cloudflare_custom_hostname_fallback_origin.app,
  ]
}
