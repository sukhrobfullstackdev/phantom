import { OAuth } from 'oauth';
import { AuthRelayerErrorCode, createOAuthHttpError } from '~/server/libs/exceptions';
import type { OAuth1ProviderConfig } from '../../types/oauth-configuration-types';

function createOAuth1Client(
  providerConfig: OAuth1ProviderConfig,
  oauthAppID: string,
  oauthAppSecret: string,
  oauthRedirectURI?: string,
) {
  return new OAuth(
    providerConfig.requestToken.endpoint,
    providerConfig.accessToken.endpoint,
    oauthAppID,
    oauthAppSecret,
    '1.0A',
    oauthRedirectURI ?? null,
    providerConfig.signatureMethod,
    32, // nonce size; 32 is default value
    { Accept: 'application/json', Connection: 'close', 'User-Agent': 'Node authentication' },
  );
}

/**
 * Request OAuth1 token.
 */
export function getOAuth1RequestToken(
  provider: string,
  providerConfig: OAuth1ProviderConfig,
  oauthAppID: string,
  oauthAppSecret: string,
  oauthRedirectURI: string,
): Promise<{ oauthToken: string; oauthTokenSecret: string }> {
  return new Promise((resolve, reject) => {
    createOAuth1Client(providerConfig, oauthAppID, oauthAppSecret, oauthRedirectURI).getOAuthRequestToken(
      (error, oauthToken, oauthTokenSecret, results) => {
        if (error) reject(formatOAuth1Error(provider, providerConfig, error));
        resolve({
          oauthToken,
          oauthTokenSecret,
        });
      },
    );
  });
}

export function getOAuth1AccessToken(
  provider: string,
  providerConfig: OAuth1ProviderConfig,
  oauthAppID: string,
  oauthAppSecret: string,
  oauthToken: string,
  oauthTokenSecret: string,
  oauthVerifier: string,
): Promise<{ oauthAccessToken: string; oauthAccessTokenSecret: string }> {
  return new Promise((resolve, reject) => {
    createOAuth1Client(providerConfig, oauthAppID, oauthAppSecret).getOAuthAccessToken(
      oauthToken,
      oauthTokenSecret,
      oauthVerifier,
      (error, oauthAccessToken, oauthAccessTokenSecret, results) => {
        if (error) reject(formatOAuth1Error(provider, providerConfig, error));
        resolve({
          oauthAccessToken,
          oauthAccessTokenSecret,
        });
      },
    );
  });
}

export function oauth1UserRequest(
  provider: string,
  providerConfig: OAuth1ProviderConfig,
  oauthAppID: string,
  oauthAppSecret: string,
  accessToken: string,
  endpoint: string,
): Promise<any> {
  const [oauthToken, oauthTokenSecret] = accessToken.replace('Bearer ', '').split('+');
  return new Promise((resolve, reject) => {
    createOAuth1Client(providerConfig, oauthAppID, oauthAppSecret).get(
      endpoint,
      oauthToken,
      oauthTokenSecret,
      (error, data, response) => {
        if (error) reject(formatOAuth1Error(provider, providerConfig, error));
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        resolve(data ? JSON.parse(data.toString()) : {});
      },
    );
  });
}

function formatOAuth1Error(
  provider: string,
  providerConfig: OAuth1ProviderConfig,
  sourceError: { statusCode: number; data?: any },
) {
  const defaultError = { error: AuthRelayerErrorCode.InternalServiceError };
  const formattedError = providerConfig.formatOAuth1Error?.(tryJSONParse(sourceError.data)) ?? {};

  return createOAuthHttpError({
    status: sourceError.statusCode,
    provider,
    ...defaultError,
    ...formattedError,
  });
}

function tryJSONParse(data: string) {
  try {
    return JSON.parse(data);
  } catch {
    return {};
  }
}
