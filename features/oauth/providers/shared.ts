import {
  AuthorizationRequestFieldConfig,
  AuthorizationResponseFieldConfig,
  AccessTokenRequestFieldConfig,
  AccessTokenResponseFieldConfig,
} from '~/features/oauth/types/oauth-configuration-types';

/**
 * Mapping of standard OAuth 2.0 "authorization" request fields to internal
 * interface.
 */
export const authorizationRequestFields: AuthorizationRequestFieldConfig = {
  appID: 'client_id',
  redirectURI: 'redirect_uri',
  state: 'state',
  scope: 'scope',
  loginHint: 'login_hint',
  codeChallenge: 'code_challenge',
  codeChallengeMethod: 'code_challenge_method',
};

/**
 * Mapping of standard OAuth 1.0a/2.0 "authorization" response fields
 * to an internal interface.
 */
export const authorizationResponseFields: AuthorizationResponseFieldConfig = {
  authorizationCode: 'code',
  idToken: 'id_token',
  state: 'state',
  error: 'error',
  errorDescription: 'error_description',
  errorURI: 'error_uri',
  oauth1Token: 'oauth_token',
  oauth1TokenSecret: 'oauth_token_secret',
  oauthVerifier: 'oauth_verifier',
  user: 'user',
};

/**
 * Mapping of standard OAuth 1.0a/2.0 "access token" request fields
 * to an internal interface.
 */
export const accessTokenRequestFields: AccessTokenRequestFieldConfig = {
  appID: 'client_id',
  appSecret: 'client_secret',
  redirectURI: 'redirect_uri',
  authorizationCode: 'code',
  state: 'state',
  codeVerifier: 'code_verifier',
};

/**
 * Mapping of standard OAuth 1.0a/2.0 "access token" response fields
 * to an internal interface.
 */
export const accessTokenResponseFields: AccessTokenResponseFieldConfig = {
  accessToken: 'access_token',
  refreshToken: 'refresh_token',
  idToken: 'id_token',
  scope: 'scope',
};
