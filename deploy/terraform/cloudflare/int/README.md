<!-- BEGINNING OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
## Requirements

| Name | Version |
|------|---------|
| <a name="requirement_terraform"></a> [terraform](#requirement\_terraform) | >= 1.3.2 |
| <a name="requirement_cloudflare"></a> [cloudflare](#requirement\_cloudflare) | ~> 4.2 |
| <a name="requirement_utils"></a> [utils](#requirement\_utils) | ~> 1.3 |

## Providers

| Name | Version |
|------|---------|
| <a name="provider_cloudflare"></a> [cloudflare](#provider\_cloudflare) | 4.7.1 |
| <a name="provider_terraform"></a> [terraform](#provider\_terraform) | n/a |

## Modules

| Name | Source | Version |
|------|--------|---------|
| <a name="module_app_page_rules"></a> [app\_page\_rules](#module\_app\_page\_rules) | git@github.com:magiclabs/infrastructure.git//tf_modules/cloudflare/page_rules | master |
| <a name="module_app_partners"></a> [app\_partners](#module\_app\_partners) | git@github.com:magiclabs/infrastructure.git//tf_modules/cloudflare/custom_hostname | master |

## Resources

| Name | Type |
|------|------|
| [cloudflare_record.app](https://registry.terraform.io/providers/cloudflare/cloudflare/latest/docs/resources/record) | resource |
| [cloudflare_record.app_assets](https://registry.terraform.io/providers/cloudflare/cloudflare/latest/docs/resources/record) | resource |
| [terraform_remote_state.magic_app](https://registry.terraform.io/providers/hashicorp/terraform/latest/docs/data-sources/remote_state) | data source |
| [terraform_remote_state.magic_cloudflare](https://registry.terraform.io/providers/hashicorp/terraform/latest/docs/data-sources/remote_state) | data source |
| [terraform_remote_state.magic_cloudflare_zero_trust](https://registry.terraform.io/providers/hashicorp/terraform/latest/docs/data-sources/remote_state) | data source |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_api_token"></a> [api\_token](#input\_api\_token) | Cloudflare API Token, should be created in personal profile page. https://dash.cloudflare.com/profile/api-tokens | `string` | `null` | no |

## Outputs

| Name | Description |
|------|-------------|
| <a name="output_zero_trust_tunnel_entry"></a> [zero\_trust\_tunnel\_entry](#output\_zero\_trust\_tunnel\_entry) | Zero Trust Tunnel entry to be added in the UI |
<!-- END OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
