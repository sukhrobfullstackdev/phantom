<!-- BEGINNING OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
## Requirements

| Name | Version |
|------|---------|
| <a name="requirement_terraform"></a> [terraform](#requirement\_terraform) | >= 1.3.2 |
| <a name="requirement_aws"></a> [aws](#requirement\_aws) | ~> 4.44 |

## Providers

| Name | Version |
|------|---------|
| <a name="provider_aws.us-west-2"></a> [aws.us-west-2](#provider\_aws.us-west-2) | 4.48.0 |
| <a name="provider_terraform"></a> [terraform](#provider\_terraform) | n/a |

## Modules

| Name | Source | Version |
|------|--------|---------|
| <a name="module_app_iam"></a> [app\_iam](#module\_app\_iam) | terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks | ~> 5.5 |

## Resources

| Name | Type |
|------|------|
| [aws_lb_listener_rule.app_partners_us-west-2](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lb_listener_rule) | resource |
| [aws_lb_listener_rule.app_us-west-2](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lb_listener_rule) | resource |
| [aws_eks_cluster.this](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/eks_cluster) | data source |
| [aws_eks_clusters.this](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/eks_clusters) | data source |
| [aws_iam_openid_connect_provider.this_eks](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/iam_openid_connect_provider) | data source |
| [aws_lb_target_group.eks_a_ngxinc_pub](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/lb_target_group) | data source |
| [terraform_remote_state.magic_aws_core_global](https://registry.terraform.io/providers/hashicorp/terraform/latest/docs/data-sources/remote_state) | data source |
| [terraform_remote_state.magic_aws_core_regional](https://registry.terraform.io/providers/hashicorp/terraform/latest/docs/data-sources/remote_state) | data source |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_app_name"></a> [app\_name](#input\_app\_name) | App name, will be used as a prefix for all resources | `string` | n/a | yes |

## Outputs

| Name | Description |
|------|-------------|
| <a name="output_app_global"></a> [app\_global](#output\_app\_global) | n/a |
| <a name="output_app_global_extra"></a> [app\_global\_extra](#output\_app\_global\_extra) | n/a |
| <a name="output_app_regional"></a> [app\_regional](#output\_app\_regional) | n/a |
<!-- END OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
