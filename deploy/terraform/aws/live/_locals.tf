locals {
  aws_profile = "Magic-Live/Admin"
  env_group   = basename(path.cwd) # Take env group from the path like ....foo/bar/${ENV_GROUP}/us-west-2

  regional_tags = {
    us-west-2 = merge(local.naming.global_tags, { "region" = "us-west-2" })
  }

  partner_domains = [
    "auth.sportx.bet",
    "auth.clashofcoins.com",
    "auth.plotx.io",
    "auth.brella.io",
    "auth.niftys.com",
    "auth.copy.ai",
    "auth.copyaidev.ai",
    "auth.sx.bet",
    "legacy.magic.link",
    "walletconnect.ftmt.xyz",
    "register.walletconnect.com",
  ]
}
