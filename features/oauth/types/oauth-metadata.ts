export interface OAuthServerMetadata {
  provider?: string;
  magic_api_key?: string;
  magic_challenge?: string;
  magic_redirect_uri?: string;
  oauth_redirect_uri?: string;
  oauth_state?: string;
  oauth_scope?: string;
  platform?: PlatformType;
  bundleId?: string;
}

export type PlatformType = 'rn' | 'web';

export interface OAuthClientMetadata {
  magic_api_key?: string;
  encrypted_access_token?: string;
}
