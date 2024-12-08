# Page rules doc: https://support.cloudflare.com/hc/en-us/articles/218411427-Understanding-and-Configuring-Cloudflare-Page-Rules-Page-Rules-Tutorial-#h_18YTlvNlZET4Poljeih3TJ
locals {
  /*
    Replace `deploy_env` in the FQDN with `*` for wildcard matching.
    For live replacement won't happen because there is no `deploy_env` in the live FQDN.
  */
  page_rules_fqdns = distinct(flatten([for k, v in local.rs_magic_app.app_global :
    [for fqdn in v.fqdns : replace(fqdn, v.deploy_env, "*")]
  ]))

  page_rules = {
    cache_level = "bypass"

    # Security
    waf                 = "on"
    browser_check       = "off"
    security_level      = "off"
    email_obfuscation   = "off"
    server_side_exclude = "off"
    rocket_loader       = "off"

    minify = {
      css  = "off"
      js   = "off"
      html = "off"
    }
  }
}

module "app_page_rules" {
  # NOTE: We use master for module versions for now, we may switch to tags in future
  # tflint-ignore: terraform_module_pinned_source
  source   = "git@github.com:magiclabs/infrastructure.git//tf_modules/cloudflare/page_rules?ref=master"
  for_each = toset(local.page_rules_fqdns)

  zone_id = local.rs_magic_cloudflare.magic_link_zone.id
  domain  = each.value
  page_rules = {
    "/*" = local.page_rules
  }

  # Override is kept for example usage, doing no real override
  page_rules_override = {
    "/*" = {
      security_level = "off"
    }
  }
}
