/*
  Following rate limiting rules are applied to the following domains:
*/
locals {
  rate_limit = {
    generic = {
      disabled  = false
      mode      = "ban"
      methods   = ["_ALL_"]
      threshold = 30
      period    = 60
      timeout   = 60
      statuses  = [400, 403, 404, 405, 429, 500]
    }
  }
}

module "app_rate_limit_generic" {
  # NOTE: We use master for module versions for now, we may switch to tags in future
  # tflint-ignore: terraform_module_pinned_source
  source = "git@github.com:magiclabs/infrastructure.git//tf_modules/cloudflare/rate_limit?ref=master"

  zone_id = local.rs_magic_cloudflare.magic_link_zone.id
  domain  = local.app_rate_limit_domain_blob
  rate_limit = {
    "/*" = merge(local.rate_limit.generic, { path_pattern = "/*" })
  }

  # Bypass allowed for the enterprise cloudflare plan only
  bypass_url_patterns = []
}

module "app_rate_limit_401" {
  # NOTE: We use master for module versions for now, we may switch to tags in future
  # tflint-ignore: terraform_module_pinned_source
  source = "git@github.com:magiclabs/infrastructure.git//tf_modules/cloudflare/rate_limit?ref=master"

  zone_id = local.rs_magic_cloudflare.magic_link_zone.id
  domain  = local.app_rate_limit_domain_blob
  rate_limit = {
    "/*" = {
      disabled     = false
      mode         = "ban"
      path_pattern = "/*"
      methods      = ["_ALL_"]
      threshold    = 150
      period       = 60
      timeout      = 60
      statuses     = [401]
    }
  }

  # Bypass allowed for the enterprise cloudflare plan only
  bypass_url_patterns = []
}
