terraform {
  required_version = ">= 1.3.2" # terraform

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.2" # cloudflare
    }
    utils = {
      source  = "cloudposse/utils"
      version = "~> 1.3"
    }
  }
}
