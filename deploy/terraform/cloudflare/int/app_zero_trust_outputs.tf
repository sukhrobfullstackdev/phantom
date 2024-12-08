# TODO(mack#sc64254|2022-10-25): Add documentation on how Cloudflare Zero Trust VPN is set-up/works

locals {
  cloudflare_hostnames = [for record in values(cloudflare_record.app) : record.hostname]
  tunneled_hostnames   = concat(local.cloudflare_hostnames, local.rs_magic_app.app_global_extra.stagef.fqdns)
}

/*
  Output repeats the Ingress cloudflared format (same naming is in the cloudflare UI).
  Outputs are used in infra repo in Cloudflare block to generate list of the resources to be added to the VPN config in the UI
  Please refer terraform/ops/cloudflare/zero_trust_tunnel.tf in infra repo for details
  https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/tunnel-guide/local/local-management/ingress/#requirements
*/
output "zero_trust_tunnel_entry" {
  value = {
    us-west-2 = [for v in local.tunneled_hostnames :
      {
        public_hostname = v
        service         = local.app_alb
        settings = {
          noTLSVerify = true
        }
      }
    ]
  }
  description = "Zero Trust Tunnel entry to be added in the UI"
}
