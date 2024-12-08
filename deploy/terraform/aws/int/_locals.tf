locals {
  aws_profile = "Magic-Int/Admin"
  env_group   = basename(path.cwd) # Take env group from the path like ....foo/bar/${ENV_GROUP}/us-west-2

  regional_tags = {
    us-west-2 = merge(local.naming.global_tags, { "region" = "us-west-2" })
  }

  partner_domains = [
    "walletconnect.stagef.ftmt.xyz",
    "legacy.stagef.magic.link",
  ]
}
