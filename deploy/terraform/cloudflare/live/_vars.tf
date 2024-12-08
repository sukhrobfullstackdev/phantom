# TODO(mack#sc64397|2022-10-25): Document how to configure local cloudflare credentials.
variable "api_token" {
  type        = string
  default     = null
  description = "Cloudflare API Token, should be created in personal profile page. https://dash.cloudflare.com/profile/api-tokens"
}
