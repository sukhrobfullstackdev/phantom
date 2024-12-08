import { URL } from 'url';
import qs from 'qs';
import { handler } from '~/server/middlewares/handler-factory';
import { CUSTOM_THEME_COOKIE, OAUTH_SERVER_META_COOKIE } from '~/shared/constants/cookies';
import { PlatformType } from '~/features/oauth/types/oauth-metadata';
import { withFields } from '~/server/middlewares/with-fields';
import { withContext } from '~/server/middlewares/with-context';
import { getRequestOrigin } from '../../libs/format-request-origin';
import { formatOAuthFields } from './oauth-field-helpers';
import { composeMiddleware } from '~/server/middlewares/compose-middleware';
import { handleOAuthServerErrors } from './send-error';
import { CookieService } from '~/server/services/cookies';
import { OAuthService } from '../../services/server';
import { normalizeOAuthScope, oauthScopeToArray, oauthScopeToString } from '~/features/oauth/libs/format-oauth-scope';
import { coreHttpErrors } from '~/server/libs/exceptions';
import { getClientConfig } from './client-config';
import { serverLogger } from '~/server/libs/datadog';
import { DASHBOARD_OAUTH_REDIRECT_PATH, MAGIC_DASHBOARD_LIST } from '~/shared/constants/magic-url';
import { getProviderConfig } from '../../libs/provider-config';
import { shared } from '../../providers';
import { RedirectAllowlistError, checkRedirectAllowlist } from '../../libs/allowlist';

export type OAuthPathParams = {
  StartV1: { provider: string };
  CallbackV1: { oauth_redirect_id: string };
};

interface AuthorizationFields {
  magic_api_key: string;
  magic_challenge: string;
  state: string;
  redirect_uri: string;
  login_hint?: string;
  scope?: string;
  platform: PlatformType;
  bundleId?: string;
}

interface AuthorizationContext {
  oauthAppID: string;
  oauthAppDbRef: string;
  oauthRedirectURI: string;
  oauthAppSecret?: string;
}

const authorizationContext = withContext<AuthorizationContext>();
const authorizationFields = withFields<AuthorizationFields>(
  ['magic_api_key', 'magic_challenge', 'state', 'redirect_uri'],
  ['login_hint', 'scope', 'platform', 'bundleId'],
);

/**
 * Attach relevant context to the request, including OAuth app ID, redirect
 * URI, high-entropy state, and the magic client ID.
 */
const getOAuthAppDetails = authorizationContext<OAuthPathParams['StartV1']>(context => {
  return authorizationFields(data => async (req, res, next) => {
    const clientConfigResponse = await getClientConfig(data.magic_api_key, req);
    const redirectUrlWithoutQueryParams = data.redirect_uri.split('?')[0];

    const redirectURL = new URL(redirectUrlWithoutQueryParams);

    const isMagicDashboardRedirectCallback =
      MAGIC_DASHBOARD_LIST.includes(redirectURL.origin) && redirectURL.pathname === DASHBOARD_OAUTH_REDIRECT_PATH;

    const { redirectUrlIsValid, redirectUrlError } = checkRedirectAllowlist({
      redirectUrl: redirectUrlWithoutQueryParams,
      redirectAllowList: clientConfigResponse?.data?.access_allowlists?.redirect_url,
      isRequired: !clientConfigResponse.data?.legacy_redirect,
    });

    // Only throw error if the allowlists.redirect_url is not empty & redirectUrl is not included
    if (!isMagicDashboardRedirectCallback && !redirectUrlIsValid) {
      switch (redirectUrlError) {
        case RedirectAllowlistError.EMPTY:
          serverLogger.error('OAuth Error Redirect Allowlist Required', {
            detail: clientConfigResponse?.data?.access_allowlists?.redirect_url,
            redirectURL: redirectUrlWithoutQueryParams,
          });

          throw coreHttpErrors.MissingRedirectAllowlist(redirectUrlWithoutQueryParams);
        case RedirectAllowlistError.MISMATCH:
        default:
          serverLogger.error('OAuth Error InvalidRedirectUrl', {
            detail: clientConfigResponse?.data?.access_allowlists?.redirect_url,
            redirectURL: redirectUrlWithoutQueryParams,
          });

          throw coreHttpErrors.InvalidRedirectUrl(redirectUrlWithoutQueryParams);
      }
    }

    const {
      oauth_app_id: oauthAppDbRef,
      app_id: oauthAppID,
      oauth_redirect_id: oauthRedirectID,
      app_secret: oauthAppSecret,
    } = (await OAuthService.getApp(req.params.provider, data.magic_api_key, req, data.platform, data.bundleId)).data;

    const oauthRedirectURI = new URL(`/v1/oauth2/${oauthRedirectID}/callback`, getRequestOrigin(req)).href;

    if (clientConfigResponse?.data?.client_theme) {
      CookieService.set(res, CUSTOM_THEME_COOKIE, clientConfigResponse?.data?.client_theme, {
        maxAge: 10 * 60 * 1000,
      });
    }

    context.merge({
      oauthAppID,
      oauthAppDbRef,
      oauthRedirectURI,
      oauthAppSecret,
    });

    next();
  });
});

/**
 * Set a secure, HttpOnly, signed, and encrypted cookie containing metadata
 * about the OAuth request to be persisted between redirects. The most sensitive
 * information saved in the cookie is the OAuth `state`, which helps to prevent
 * CSRF attacks.
 */
const setMetadataCookie = authorizationContext<OAuthPathParams['StartV1']>(context => {
  return authorizationFields(data => (req, res, next) => {
    const ctx = context.get();
    const providerConfig = getProviderConfig(req.params.provider, 1);

    let domain = req.hostname;
    if (!domain.includes('localhost')) {
      domain = '.magic.link';
    }

    CookieService.set(
      res,
      OAUTH_SERVER_META_COOKIE,
      {
        provider: req.params.provider,
        magic_api_key: data.magic_api_key,
        magic_challenge: data.magic_challenge,
        magic_redirect_uri: data.redirect_uri,
        oauth_redirect_uri: ctx.oauthRedirectURI,
        oauth_scope: oauthScopeToString([...(providerConfig.authorization.defaultScopes || []), data.scope]),
        oauth_state: data.state,
        platform: data.platform || 'web',
        bundleId: data.bundleId,
      },
      { domain },
    );

    next();
  });
});

/**
 * Middleware which parses the request data and redirects to the OAuth service
 * provider's authorization endpoint.
 */
const redirectToAuthorizationServer = authorizationContext<OAuthPathParams['StartV1']>(context => {
  return authorizationFields(data =>
    handler(async (req, res, next) => {
      const ctx = context.get();
      const providerConfig = getProviderConfig(req.params.provider, 1);
      let redirectHref: string;

      if (providerConfig.oauthVersion === 1) {
        const { oauthToken } = await OAuthService.oauth1.getOAuth1RequestToken(
          req.params.provider,
          providerConfig,
          ctx.oauthAppID!,
          ctx.oauthAppSecret!,
          ctx.oauthRedirectURI!,
        );
        redirectHref = new URL(`?oauth_token=${oauthToken}`, providerConfig.authorization.endpoint).href;
      } else {
        const fields = formatOAuthFields(
          shared.authorizationRequestFields,

          {
            appID: ctx.oauthAppID,
            redirectURI: ctx.oauthRedirectURI,
            scope: normalizeOAuthScope([
              ...(providerConfig.authorization.defaultScopes || []),
              ...oauthScopeToArray(data.scope),
            ]),
            state: data.state,
            loginHint: data.login_hint,
          },

          providerConfig.authorization.defaultParams,
        );

        redirectHref = new URL(`?${qs.stringify(fields)}`, providerConfig.authorization.endpoint).href;
      }

      res.status(302).redirect(redirectHref);
    }),
  );
});

/**
 * The final, composed middleware to handle OAuth authorization logic.
 */
export const oauthAuthorization = composeMiddleware(
  getOAuthAppDetails,
  setMetadataCookie,
  redirectToAuthorizationServer,
  handleOAuthServerErrors,
);
