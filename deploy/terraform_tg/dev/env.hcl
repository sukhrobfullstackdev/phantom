locals {
  env_group       = "int"
  partner_domains = []

  # AWS specific values
  aws_profile = "Magic-Int/Admin"

  # K8s specific values
  /*
    Normally following hardcoded values should be passed as a dependency, Example:
    https://github.com/magiclabs/nft-api/blob/master/deploy/terraform/stagef/us-west-2/k8s/terragrunt.hcl

    Currently we have not moved this repo so use terragrunt, so hardcode would be best workaround currently
  */
  eks_cluster = {
    cluster_name                       = "int-eks-a-us-west-2"
    cluster_endpoint                   = "https://968DC4FD124BDC2152BCF7A09D08EA23.gr7.us-west-2.eks.amazonaws.com"
    cluster_certificate_authority_data = "LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUMvakNDQWVhZ0F3SUJBZ0lCQURBTkJna3Foa2lHOXcwQkFRc0ZBREFWTVJNd0VRWURWUVFERXdwcmRXSmwKY201bGRHVnpNQjRYRFRJek1EUXdOakUwTWpBME1Wb1hEVE16TURRd016RTBNakEwTVZvd0ZURVRNQkVHQTFVRQpBeE1LYTNWaVpYSnVaWFJsY3pDQ0FTSXdEUVlKS29aSWh2Y05BUUVCQlFBRGdnRVBBRENDQVFvQ2dnRUJBTG9LClFzTHNaM0dERko1Ym5LampOYmpLSG0zamkrMm4ycnFVSzNBb0dZd1BnVHdSMHgyTzZ3Mkg2eGd1cnduSkJvYk8KeW1tTW5MMUlZaFUvK1B3d0h0byt0S3V4d3lXSUtMeFIwMzJQSjNuUmRFcHhUbXdaM0FENWhwVGc2eitrVk9iNwp3NHBzR1FVYjA2Y0xQZ295blFFaWFSelNNTWNpUHBFVHlBZmFKV2ZDNXdTa1M2REx0ekkyNFQ4NTgzU1djRjFwCktISFhkR1VJTTZEY1hjUXJqZFJpZ1hadzlRWW9OZkJTdmMrcVlmcjd1SS9sT3JkeEpRWXE2N2UrMUorbC9hMDQKK2p4dEtrbjlFOG5CZCthWjc5VHBIVDZSTlphTFNSR21KWmlFM012THlDYzJ4ditRSXRpYzNkbG1JMkJPZ012ago4ZHNMdmlCellMRWFBOFl2bkhFQ0F3RUFBYU5aTUZjd0RnWURWUjBQQVFIL0JBUURBZ0trTUE4R0ExVWRFd0VCCi93UUZNQU1CQWY4d0hRWURWUjBPQkJZRUZKOGJuTzRtNURlRHd5UUxWcHlGZ1hyeGwvdEtNQlVHQTFVZEVRUU8KTUF5Q0NtdDFZbVZ5Ym1WMFpYTXdEUVlKS29aSWh2Y05BUUVMQlFBRGdnRUJBQnZIcU1Ubkt1eGphMUk4WTJ1egpGS3BYSko4K0QxTXRMeGtWUkdTMUZoa2FDR0lrSGlMU0oxUHl3aXk5NGRvTGJLUkdRaVZqZy80c0ZPSTJiRkFVCkkvUVFzRGVOQytsRG10Kzc0RkxsNndHK2ZsSFdBQXpxSUp4Vk1SZlV5elc1UkVMbmtBTTNYNnd2VFk3cjcvVWMKWmQrd2k2OVFUWlRvRUNsMWNoRktxdkJwM0pnblFLbTZPek96NmtibmkwOHhVckNERFJwWjJzMnY4cGRTYitjZgpsdmFROUtwbWoyQzEwbDJ2ckxXTU54UXNDbXRGbmt5Tk1DcE9YaUx1c2JRK0F4TVFKc2I4aENhY1BaOWZiVnZ5CkRxSkdhdE9ZRG9GbHhUaHpIMGYvR0hiRTNJaDBaVFBObjUzUWJiUjBCNUNBQk1PTnlWd3VuT1loNmx3VndOSW4KeW1ZPQotLS0tLUVORCBDRVJUSUZJQ0FURS0tLS0tCg=="
  }
}
