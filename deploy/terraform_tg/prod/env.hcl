locals {
  env_group = "live"
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

  # AWS specific values
  aws_profile = "Magic-Live/Admin"

  # K8s specific values
  /*
    Normally following hardcoded values should be passed as a dependency, Example:
    https://github.com/magiclabs/nft-api/blob/master/deploy/terraform/stagef/us-west-2/k8s/terragrunt.hcl

    Currently we have not moved this repo so use terragrunt, so hardcode would be best workaround currently
  */
  eks_cluster = {
    cluster_name                       = "live-eks-a-us-west-2"
    cluster_endpoint                   = "https://DE5ED9D17ABCB8DF42F3C4ED05624F35.gr7.us-west-2.eks.amazonaws.com"
    cluster_certificate_authority_data = "LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUMvakNDQWVhZ0F3SUJBZ0lCQURBTkJna3Foa2lHOXcwQkFRc0ZBREFWTVJNd0VRWURWUVFERXdwcmRXSmwKY201bGRHVnpNQjRYRFRJek1EUXhPREUyTWpFek1Wb1hEVE16TURReE5URTJNakV6TVZvd0ZURVRNQkVHQTFVRQpBeE1LYTNWaVpYSnVaWFJsY3pDQ0FTSXdEUVlKS29aSWh2Y05BUUVCQlFBRGdnRVBBRENDQVFvQ2dnRUJBUG1YCkYyQkFsblU0QW1BcjBRKysvNWlGU1hibm5CUzkvbUZ5QWNoejFlYlZEOXhtN1lJdDVyRDhxZVBCV284WUc1KzgKUDhTNk00SVFpZVdQTWtMZVV6YUJYWHZNRGFlT1JpU253dndMVGhlMFp2b1M3RlZQSDFzTXdVellrdmVvRHNXQgozWFh1L3B2ekpIb29oWTZaZU9HeDdUMG1obVBqdXhjTVdYdUlsTTFJS1F1S3M1OFFiam01cGh3NGcxMjk5ZmJECjVsNGtmdUhrQXA0N1JXc2d3a3pXcW9BMktORHdVMlVDUGEwT0Z4d1pvVGdVWGlubThMcnVDNElsMHNRaDhUVFkKUHJSNTFEdEtMM0xheUo0cFEzRUM0c0R4clNEcWlyVERXc29wQ1JDQXJCY2RVSnlHZmlLZXk1ajBXbmFhVjl3bwpUdDUrY1N6QndGWGJzWjhmelgwQ0F3RUFBYU5aTUZjd0RnWURWUjBQQVFIL0JBUURBZ0trTUE4R0ExVWRFd0VCCi93UUZNQU1CQWY4d0hRWURWUjBPQkJZRUZBd3FCQi9nN2pRamp5eFFFNXJ0SkpVdzUzdWpNQlVHQTFVZEVRUU8KTUF5Q0NtdDFZbVZ5Ym1WMFpYTXdEUVlKS29aSWh2Y05BUUVMQlFBRGdnRUJBRnBWbGZOa2lsaWZXNVJUMEJkeQpDUHQrcFFWVGZFb2ZjcVptcU1ZOFM4R3FyVTB5ZUZOV0gxSHBlRDczLzRBem5oV1U2amZuNUxEclI1NHcyck40ClZRdzlqbEM4SnM1R2pBditDZHZVRHFhbXh5TS9vSU1EUkpMT1BDSlNqLzIrVmg2THJLdFMxQ1ltK0RQQ3h6ZW4KNWhidDIrWnI1by9GVTNVRU13RkRHZnBTbVQ4NUlsQ3RlQm1lRHByUVEyc0RpbjRJckhZbkovS3JWcDlicWt4egpFWFFqTDFxc1k0eWpsNTlLbWswZXdxZDEyNnFib29pUXJjVU1IQzRndE5KRHh2SjU5VkNxZGxONHV2VlU0bEoxCmNBbWsrb1EvSDVyOVp6Rkw4bjNvVXR5N2JlU2kvbVRQbm4zdThrVStJemZKbnlqSGhaUGx1eitramhsK1ptdFMKMm5JPQotLS0tLUVORCBDRVJUSUZJQ0FURS0tLS0tCg=="
  }

  hpa = {
    min_replicas = 5
    max_replicas = 20
    behavior = [{
      scale_up = {
        stabilization_window_seconds = 0
        select_policy                = "Max"

        policy = [
          {
            type           = "Percent"
            value          = 100
            period_seconds = 5
          },
          {
            type           = "Pods"
            value          = 20
            period_seconds = 5
          }
        ]
      }

      scale_down = {
        stabilization_window_seconds = 600
        select_policy                = "Min"

        policy = [
          {
            type           = "Percent"
            value          = 10
            period_seconds = 300
          },
          {
            type           = "Pods"
            value          = 30
            period_seconds = 300
          }
        ]
      }
    }]
  }
}
