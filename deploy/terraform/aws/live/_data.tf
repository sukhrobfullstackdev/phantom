data "aws_lb_target_group" "eks_a_ngxinc_pub" {
  provider = aws.us-west-2

  name = "${local.env_group}-eks-a-ngxinc-pub-us-west-2"

  tags = {
    env_group = local.env_group
  }
}

data "aws_eks_clusters" "this" { provider = aws.us-west-2 }

data "aws_eks_cluster" "this" {
  provider = aws.us-west-2

  for_each = toset(data.aws_eks_clusters.this.names)
  name     = each.value
}

data "aws_iam_openid_connect_provider" "this_eks" {
  provider = aws.us-west-2

  for_each = data.aws_eks_cluster.this
  url      = one(flatten(data.aws_eks_cluster.this[each.key].identity[*].oidc[*].issuer))
}
