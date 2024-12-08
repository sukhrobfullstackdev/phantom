// --- Abstract Field Types ------------------------------------------------- //

import { OpenIDConnectFields, OpenIDConnectUserInfo } from '~/features/oauth/types/open-id-connect';

export type AbstractOAuthFieldConfig<TDataTypes extends Record<string, any> = Record<string, any>> = {
  // This mapping associates our internal, generalized field name with an
  // implementation-specific field name.
  [P in keyof TDataTypes]: string;
};

export type AbstractOAuthFieldValues<TFieldConfig extends AbstractOAuthFieldConfig = AbstractOAuthFieldConfig> =
  TFieldConfig extends AbstractOAuthFieldConfig<infer TDataTypes>
    ? {
        [K in keyof TDataTypes]?: TDataTypes[K];
      }
    : never;

// --- Authorization Field Types -------------------------------------------- //

// Authorization Request
export type AuthorizationRequestFieldConfig = AbstractOAuthFieldConfig<{
  appID: string;
  redirectURI: string;
  scope: string[];
  state: string;
  loginHint: string;
  codeChallenge?: string;
  codeChallengeMethod?: 'plain' | 'S256';
}>;
export type AuthorizationRequestFieldValues = AbstractOAuthFieldValues<AuthorizationRequestFieldConfig>;

// Authorization Response
export type AuthorizationResponseFieldConfig = AbstractOAuthFieldConfig<{
  authorizationCode: string;
  idToken?: string;
  state: string;
  error?: string;
  errorDescription?: string;
  errorURI?: string;
  oauth1Token?: string;
  oauth1TokenSecret?: string;
  oauthVerifier?: string;
  user?: any;
}>;
export type AuthorizationResponseFieldValues = AbstractOAuthFieldValues<AuthorizationResponseFieldConfig>;

// --- Access Token Field Types --------------------------------------------- //

// Access Token Request
export type AccessTokenRequestFieldConfig = AbstractOAuthFieldConfig<{
  appID: string;
  appSecret: string;
  redirectURI: string;
  authorizationCode: string;
  state: string;
  codeVerifier?: string;
}>;
export type AccessTokenRequestFieldValues = AbstractOAuthFieldValues<AuthorizationRequestFieldConfig>;

// Access Token Response
export type AccessTokenResponseFieldConfig = AbstractOAuthFieldConfig<{
  accessToken: string;
  refreshToken: string;
  idToken?: string;
  scope: string;
  user?: any;
}>;
export type AccessTokenResponseFieldValues = AbstractOAuthFieldValues<AccessTokenResponseFieldConfig>;

// --- Provider Configuration Types ----------------------------------------- //

interface BaseEndpointConfig {
  endpoint: string;
}

interface AuthorizationConfig extends BaseEndpointConfig {
  endpoint: string;

  /**
   * Scopes to include by default with the authorization request.
   */
  defaultScopes?: string[];

  /**
   * Fields given here will be passed into the
   * authorization query as is.
   */
  defaultParams?: Record<string, any>;
}

interface OAuth2AccessTokenConfig extends BaseEndpointConfig {
  endpoint: string;

  /**
   * Fields given here will be passed into the
   * access token query as is.
   */
  defaultParams?: Record<string, any>;

  /**
   * Sets the `Content-Type` header for the access token request.
   */
  contentType: 'application/json' | 'application/x-www-form-urlencoded';
}

interface UserInfoConfig {
  endpoint: 'INTERNAL' | string;
  excludeFromSources?: boolean;
  formatResponse?: (data: any) => OpenIDConnectUserInfo<'snake_case'>;
  remapOpenIDConnectFields?: Array<[string, OpenIDConnectFields]>;
}

interface BaseProviderConfig {
  authorization: AuthorizationConfig;
  getPayloadForUserCreateService?: (accessTokenRes: AccessTokenResponseFieldValues) => any;
  userInfo?: UserInfoConfig[];
  useMagicServerCallback?: boolean;
}

export type OAuth1ProviderConfig = BaseProviderConfig & {
  oauthVersion: 1;
  requestToken: BaseEndpointConfig;
  accessToken: BaseEndpointConfig;

  /**
   * OAuth errors from 1.0a flows require some additional processing to format the error response.
   */
  formatOAuth1Error?: (sourceError?: any) => {
    error: string;
    errorDescription?: string;
    errorURI?: string;
  };

  /**
   * The algorithm used during OAuth 1.0a flows to generate a signed
   * authorization header. This value is specific to the provider's
   * implementation.
   */
  signatureMethod: 'HMAC-SHA1' | 'RSA-SHA1';
};

export type OAuth2ProviderConfig = BaseProviderConfig & {
  oauthVersion: 2;
  accessToken?: OAuth2AccessTokenConfig;
};

export type OAuthProviderConfig = OAuth1ProviderConfig | OAuth2ProviderConfig;

export type SupportedOAuthProviders = Record<string, OAuthProviderConfig>;
