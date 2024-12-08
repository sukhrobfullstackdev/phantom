import { URL } from 'url';
import { serverLogger } from '~/server/libs/datadog';
import { coreHttpErrors } from '~/server/libs/exceptions';
import { composeMiddleware } from '~/server/middlewares/compose-middleware';
import { withContext } from '~/server/middlewares/with-context';
import { withFields } from '~/server/middlewares/with-fields';
import { CookieService } from '~/server/services/cookies';
import { OAUTH_SERVER_META_COOKIE } from '~/shared/constants/cookies';
import { DASHBOARD_OAUTH_REDIRECT_PATH, MAGIC_DASHBOARD_LIST } from '~/shared/constants/magic-url';
import { getClientConfig } from './client-config';
import { handleOAuthServerErrors } from './send-error';

type OAuthPathParams = {
  DetourStartV2: { provider: string };
};

interface DetourStartFields {
  magic_api_key: string;
  state: string;
  redirect_uri: string;
  provider_authorization_url?: string;
}

interface DetourStartContext {}

const detourStartContext = withContext<DetourStartContext>();
const detourStartFields = withFields<DetourStartFields>([
  'magic_api_key',
  'state',
  'redirect_uri',
  'provider_authorization_url',
]);

/**
 * Attach relevant context to the request, including OAuth app ID, redirect
 * URI, high-entropy state, and the magic client ID.
 */
const checkAllowlist = detourStartContext<OAuthPathParams['DetourStartV2']>(() => {
  return detourStartFields(data => async (req, res, next) => {
    const clientConfigResponse = await getClientConfig(data.magic_api_key, req);
    const redirectUrlWithoutQueryParams = data.redirect_uri.split('?')[0];
    const redirectURL = new URL(redirectUrlWithoutQueryParams);

    const isMagicDashboardRedirectCallback =
      MAGIC_DASHBOARD_LIST.includes(redirectURL.origin) && redirectURL.pathname === DASHBOARD_OAUTH_REDIRECT_PATH;

    // Only throw error if the allowlists.redirect_url is not empty & redirectUrl is not included
    if (
      !isMagicDashboardRedirectCallback &&
      clientConfigResponse?.data?.access_allowlists?.redirect_url?.length > 0 &&
      !clientConfigResponse?.data?.access_allowlists?.redirect_url?.includes(redirectUrlWithoutQueryParams)
    ) {
      serverLogger.error('OAuth Error InvalidRedirectUrl', {
        detail: clientConfigResponse?.data?.access_allowlists?.redirect_url,
        redirectURL: redirectUrlWithoutQueryParams,
        ...(data.provider_authorization_url && { isOauthV2: true }),
      });

      throw coreHttpErrors.InvalidRedirectUrl(redirectUrlWithoutQueryParams);
    }
    next();
  });
});

/**
 * If this provider has useMagicServerCallback enabled, then set specialized
 * server meta cookie and redirect early ith the provider_authorization_url
 */
const handleOAuthRedirect = detourStartContext<OAuthPathParams['DetourStartV2']>(() => {
  return detourStartFields(data => async (req, res) => {
    if (data.provider_authorization_url) {
      CookieService.set(res, OAUTH_SERVER_META_COOKIE, {
        provider: req.params.provider,
        magic_redirect_uri: data.redirect_uri,
        oauth_state: data.state,
        is_oauth_v2: true,
      });

      return res.status(302).redirect(data.provider_authorization_url);
    }
  });
});

/**
 * The final, composed middleware to handle OAuth detour start logic.
 */
export const oauthDetourStart = composeMiddleware(checkAllowlist, handleOAuthRedirect, handleOAuthServerErrors);
