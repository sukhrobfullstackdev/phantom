module "app_partners" {
  # NOTE: We use master for module versions for now, we may switch to tags in future
  # tflint-ignore: terraform_module_pinned_source
  source   = "git@github.com:magiclabs/infrastructure.git//tf_modules/cloudflare/custom_hostname?ref=master"
  for_each = toset(local.rs_magic_app.app_global_extra.stagef.fqdns)

  zone_id  = local.rs_magic_cloudflare.magic_link_zone.id
  hostname = each.value

  certificate_authority = "lets_encrypt"
  ssl_validation_method = "http"

  custom_origin = {
    target = "auth.stagef.magic.link"
    suffix = "auth.stagef.magic.link"
    sni    = "auth.stagef.magic.link"
  }

  # Page rules should be same to what app_page_rules has
  page_rules = {
    "/*" = local.page_rules
  }
}
