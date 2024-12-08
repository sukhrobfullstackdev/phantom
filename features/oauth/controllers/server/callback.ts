/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */

import qs from 'qs';
import { handler } from '~/server/middlewares/handler-factory';
import { formatOAuthFields, parseOAuthFields } from './oauth-field-helpers';
import { composeMiddleware } from '~/server/middlewares/compose-middleware';
import {
  AccessTokenResponseFieldValues,
  AuthorizationResponseFieldValues,
} from '~/features/oauth/types/oauth-configuration-types';
import { withContext } from '~/server/middlewares/with-context';
import { HttpService, withXForwardedFor } from '~/server/services/http';
import { coreHttpErrors, createOAuthHttpError } from '~/server/libs/exceptions';
import { handleOAuthServerErrors } from './send-error';
import { OAuthService } from '../../services/server';
import { CookieService } from '~/server/services/cookies';
import { serverLogger } from '~/server/libs/datadog';
import {
  CSRF_TOKEN_COOKIE,
  LOGIN_FLOW_CONTEXT_COOKIE,
  MFA_FACTORS_REQUIRED_COOKIE,
  OAUTH_CLIENT_META_COOKIE,
  OAUTH_MOBILE_BUNDLE_ID,
  OAUTH_REQUEST_ID_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from '~/shared/constants/cookies';
import { shared } from '../../providers';
import { getProviderConfig } from '../../libs/provider-config';

export type OAuthPathParams = {
  StartV1: { provider: string };
  CallbackV1: { oauth_redirect_id: string };
};

interface CallbackContext {
  authorizationResponse: AuthorizationResponseFieldValues;
  accessTokenResponse: AccessTokenResponseFieldValues;
  oauthAppID: string;
  oauthAppDbRef: string;
  oauthAppSecret: string;
}

const callbackContext = withContext<CallbackContext>();

/**
 * Before the OAuth callback can be processed, we have to make sure the metadata
 * cookies set during the authorization step are present, valid, and
 * un-tampered. Because we sign/encrypt the `_oaservermeta` cookie, it will be
 * falesy if parsing fails.
 */
const ensureMetadataCookiePresenceAndIntegrity = handler<OAuthPathParams['CallbackV1']>((req, res, next) => {
  // If the request to our callback was made with the `POST` method, we have to
  // redirect to a `GET` method so that our OAuth cookies (`SameSite=Lax`) are
  // included.
  if (req.method === 'POST') {
    const queryString = qs.stringify(req.body);
    return res.status(302).redirect(`${req.path}?${queryString}`);
  }

  if (!req.ext.signedCookies._oaservermeta) {
    // Reaching this condition means the request has invalid, missing, or
    // tampered cookies. We raise an error and stop the flow!
    serverLogger.error('OAuth Error OAuthCookieSignatureError', { cookies: req.ext.signedCookies });
    throw coreHttpErrors.OAuthCookieSignatureError();
  }

  next();
});

const parseAuthorizationResponse = callbackContext<OAuthPathParams['CallbackV1']>(context => {
  return handler(async (req, res, next) => {
    const authorizationResponse = parseOAuthFields(req.query, shared.authorizationResponseFields);

    if (authorizationResponse.error) {
      serverLogger.error('OAuth Error parseAuthorizationResponse', { cookies: req.ext.signedCookies });

      throw createOAuthHttpError({
        status: 400,
        provider: req.ext.signedCookies._oaservermeta?.provider!,
        error: authorizationResponse.error,
        errorDescription: authorizationResponse.errorDescription,
        errorURI: authorizationResponse.errorURI,
      });
    }

    context.merge({ authorizationResponse });

    next();
  });
});

/**
 * Ensure the request is not tampered with by comparing the `_oaservermeta`
 * cookie state with the value parsed from\ query parameters.
 */
const compareState = callbackContext<OAuthPathParams['CallbackV1']>(context => {
  return (req, res, next) => {
    const ctx = context.get();
    const cookieState = req.ext.signedCookies._oaservermeta?.oauth_state ?? '';
    const providerState = ctx.authorizationResponse?.state ?? '';
    const providerConfig = getProviderConfig(req.ext.signedCookies._oaservermeta?.provider!, 1);

    if (cookieState !== providerState && providerConfig.oauthVersion === 2) {
      serverLogger.error('OAuth Error: OAuth State Mismatch', {
        cookieState,
        providerState,
        isOauthV2: req.ext?.signedCookies._oaservermeta?.is_ouath_v2!,
      });

      throw coreHttpErrors.OAuthStateMismatch();
    }

    next();
  };
});

const handleOAuthV2Redirect = callbackContext<OAuthPathParams['CallbackV1']>(() => {
  return handler(async (req, res, next) => {
    const oauthMetadata = req.ext.signedCookies._oaservermeta;

    if (oauthMetadata?.is_oauth_v2) {
      if (!oauthMetadata?.magic_redirect_uri) {
        throw coreHttpErrors.MissingRequiredFields(['magic_redirect_uri']);
      }

      return res.status(302).redirect(`${oauthMetadata?.magic_redirect_uri}?${qs.stringify(req.query)}`);
    }

    next();
  });
});

/**
 * Attach relevant context to the request, including OAuth app ID and app
 * secret.
 */
const getOAuthAppDetails = callbackContext<OAuthPathParams['CallbackV1']>(context => {
  return handler(async (req, res, next) => {
    const {
      oauth_app_id: oauthAppDbRef,
      app_id: oauthAppID,
      app_secret: oauthAppSecret,
    } = (
      await OAuthService.getApp(
        req.ext.signedCookies._oaservermeta?.provider!,
        req.ext.signedCookies._oaservermeta?.magic_api_key!,
        req,
        req.ext.signedCookies._oaservermeta?.platform,
        req.ext.signedCookies._oaservermeta?.bundleId,
      )
    ).data;

    context.merge({
      oauthAppID,
      oauthAppDbRef,
      oauthAppSecret,
    });

    next();
  });
});

/**
 * Retrieves the access token by trading the authorization code with the OAuth
 * provider.
 */
const getAccessToken = callbackContext<OAuthPathParams['CallbackV1']>(context => {
  return handler(async (req, res, next) => {
    const ctx = context.get();
    const oauthMetadata = req.ext.signedCookies._oaservermeta;
    const { provider } = oauthMetadata;
    const providerConfig = getProviderConfig(provider as string, 1);
    let accessTokenResponse = {} as any;

    if (providerConfig.oauthVersion === 1) {
      const { oauthAccessToken, oauthAccessTokenSecret } = await OAuthService.oauth1.getOAuth1AccessToken(
        provider,
        providerConfig,
        ctx.oauthAppID!,
        ctx.oauthAppSecret!,
        ctx.authorizationResponse?.oauth1Token!,
        ctx.authorizationResponse?.oauth1TokenSecret!,
        ctx.authorizationResponse?.oauthVerifier!,
      );

      accessTokenResponse.accessToken = `${oauthAccessToken}+${oauthAccessTokenSecret}`;
    } else {
      const fields = formatOAuthFields(
        shared.accessTokenRequestFields,

        {
          appID: ctx.oauthAppID,
          appSecret: ctx.oauthAppSecret,
          redirectURI: oauthMetadata?.oauth_redirect_uri,
          authorizationCode: ctx.authorizationResponse?.authorizationCode,
          state: ctx.authorizationResponse?.state,
        },

        providerConfig.accessToken?.defaultParams,
      );

      accessTokenResponse = parseOAuthFields(
        await HttpService.oauth(provider).post(
          providerConfig.accessToken?.endpoint || '',
          providerConfig.accessToken?.contentType === 'application/json' ? fields : qs.stringify(fields),
          { headers: withXForwardedFor({ 'Content-Type': providerConfig.accessToken?.contentType }, req) },
        ),
        shared.accessTokenResponseFields,
      );
      accessTokenResponse.user = ctx.authorizationResponse?.user;
    }

    context.merge({ accessTokenResponse });

    next();
  });
});

/**
 * Persists KMS session refresh cookies. At this stage of the OAuth flow, we
 * trade the access token for KMS refresh tokens & provide our internal API with
 * the `magic_challenge` developer's generated client-side at the beginning of
 * the flow.
 */
const persistCredentials = callbackContext<OAuthPathParams['CallbackV1']>(context => {
  return handler(async (req, res, next) => {
    const ctx = context.get();

    const { provider } = req.ext.signedCookies._oaservermeta!;
    const providerConfig = getProviderConfig(provider as string, 1);
    const getPayload = providerConfig.getPayloadForUserCreateService ?? (() => undefined);

    const {
      auth_user_refresh_token,
      auth_user_csrf,
      refresh_token_period_in_days,
      encrypted_access_token,
      magic_oauth_request_id,
      login_flow_context,
      factors_required,
    } = (
      await OAuthService.createUser(
        {
          accessToken: ctx.accessTokenResponse?.accessToken!,
          refreshToken: ctx.accessTokenResponse?.refreshToken!,
          oauthAppDbRef: ctx.oauthAppDbRef!,
          oauthProviderPayload: {
            provider,
            payload: getPayload(ctx.accessTokenResponse!),
          },
        },

        req,
      )
    ).data;

    const isMfaEnabled = !auth_user_refresh_token && login_flow_context && factors_required;

    if (isMfaEnabled) {
      CookieService.set(res, LOGIN_FLOW_CONTEXT_COOKIE, login_flow_context);
      CookieService.set(res, MFA_FACTORS_REQUIRED_COOKIE, factors_required);
    } else {
      // clear any existing MFA cookie
      CookieService.clear(res, LOGIN_FLOW_CONTEXT_COOKIE);
      CookieService.clear(res, MFA_FACTORS_REQUIRED_COOKIE);
      // (this will be used to generate the "magic_credential" client-side)
      CookieService.set(res, REFRESH_TOKEN_COOKIE, auth_user_refresh_token, {
        maxAge: refresh_token_period_in_days * 24 * 60 * 60 * 1000,
      });
    }

    CookieService.set(res, CSRF_TOKEN_COOKIE, auth_user_csrf, {
      maxAge: (refresh_token_period_in_days || 30) * 24 * 60 * 60 * 1000,
    });
    CookieService.set(res, OAUTH_REQUEST_ID_COOKIE, magic_oauth_request_id);
    CookieService.set(res, OAUTH_CLIENT_META_COOKIE, {
      magic_api_key: req.ext.signedCookies._oaservermeta?.magic_api_key,
      encrypted_access_token,
    });

    // Set bundle ID in the cookies for the requests in Credential Create Page
    CookieService.set(res, OAUTH_MOBILE_BUNDLE_ID, req.ext.signedCookies._oaservermeta!.bundleId);
    next();
  });
});

/**
 * Redirects to the client-side Auth Relayer, where a special DID token is
 * generated with the encrypted access token as a signed attachment. We refer to
 * this DIDT as the "magic_credential."
 */
const redirectToCredentialClient = handler(async (req, res, next) => {
  res.status(302).redirect('/v1/oauth2/credential/create');
});

/**
 * The final, composed middleware to handle OAuth callback logic.
 */
export const oauthCallback = composeMiddleware(
  ensureMetadataCookiePresenceAndIntegrity,
  parseAuthorizationResponse,
  handleOAuthV2Redirect,
  getOAuthAppDetails,
  compareState,
  getAccessToken,
  persistCredentials,
  redirectToCredentialClient,
  handleOAuthServerErrors,
);
