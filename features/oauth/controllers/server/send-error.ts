import qs from 'qs';
import { URL } from 'url';
import { composeErrorMiddleware } from '~/server/middlewares/compose-middleware';
import { errorHandler, handler } from '~/server/middlewares/handler-factory';
import { handleErrorsClientSide } from '~/server/middlewares/error-handlers';
import { createErrorSignature, isOAuthError } from '~/server/libs/exceptions';
import { withFields } from '~/server/middlewares/with-fields';
import { CookieService } from '~/server/services/cookies';
import { createResponseJson } from '~/server/libs/response';
import {
  CUSTOM_THEME_COOKIE,
  OAUTH_CLIENT_META_COOKIE,
  OAUTH_REQUEST_ID_COOKIE,
  OAUTH_SERVER_META_COOKIE,
} from '~/shared/constants/cookies';
import { serverLogger } from '~/server/libs/datadog';

// Error fields formatted per the OAuth 2.0 spec. Our typical nomeclature of
// `error_code` and `message` maps to `error` and `error_description`
// respectively. The `error_uri` field is an OAuth-specific concept,
// representing a URL developers may follow to learn more about the specific
// error raised.
interface OAuthFormattedError {
  error: string;
  error_description: string;
  error_uri?: string;
}

/**
 * Handle Errors raised during the OAuth flow. First, we attempt to redirect
 * error information back to the developer. Failing that, errors are routed
 * client-side, where a generic Auth Relayer error UI is presented.
 */
export const handleOAuthServerErrors = composeErrorMiddleware(
  errorHandler((error, req, res, next) => {
    const redirectURI = req.ext.signedCookies._oaservermeta?.magic_redirect_uri;
    const platform = req.ext.signedCookies._oaservermeta?.platform;

    if (error) {
      serverLogger.error('OAuth Error', {
        signedCookies: req.ext.signedCookies,
        error,
      });
    }

    CookieService.clear(res, OAUTH_CLIENT_META_COOKIE);
    CookieService.clear(res, OAUTH_SERVER_META_COOKIE);
    CookieService.clear(res, OAUTH_REQUEST_ID_COOKIE);
    CookieService.clear(res, CUSTOM_THEME_COOKIE);

    if (redirectURI && isOAuthError(error) && platform === 'web') {
      const { provider, error: errorCode, error_description, error_uri } = error.data.oauth;

      const oauthFormattedError: OAuthFormattedError = {
        error: errorCode,
        error_description,
        error_uri,
      };

      const query = qs.stringify({
        ...oauthFormattedError,
        provider,
      });

      res.status(302).redirect(new URL(`?${query}`, redirectURI).href);
    } else {
      /* Other errors will be rendered via 302 redirection to Client.SendErrorV1 */
      next(error);
    }
  }),

  handleErrorsClientSide,
);

/**
 * This controller formats an OAuth HTTP error from the request query
 * parameters. We use this to route errors that occur client-side while
 * generating the "magic_credential" DID Token.
 *
 * Accessing Oauth/SendErrorV1 Endpoint will trigger this handler,
 * Error will be sent back to the client-side in the response and render without redirection
 */
export const oauthSendErrorViaQueryParameters = withFields<OAuthFormattedError>(
  ['error', 'error_description'],
  ['error_uri'],
)(data => {
  return handler((req, res) => {
    const redirectURI = req.ext.signedCookies._oaservermeta?.magic_redirect_uri;
    const platform = req.ext.signedCookies._oaservermeta?.platform;

    CookieService.clear(res, OAUTH_CLIENT_META_COOKIE);
    CookieService.clear(res, OAUTH_SERVER_META_COOKIE);
    CookieService.clear(res, OAUTH_REQUEST_ID_COOKIE);
    CookieService.clear(res, CUSTOM_THEME_COOKIE);

    const { error, error_description, error_uri } = data;
    const errSig = createErrorSignature({ error, error_description, error_uri });

    let query = qs.stringify({ ...req.query, s: errSig });

    if (redirectURI && platform === 'web') {
      const oauthFormattedError: OAuthFormattedError = {
        error,
        error_description,
        error_uri,
      };

      query = qs.stringify({
        ...oauthFormattedError,
        provider: req.ext.signedCookies._oaservermeta?.provider,
      });
    }

    /* Generate a URL for browser to redirect back */
    res.status(200).json(
      createResponseJson({
        platform,
        query,
        redirectURI: redirectURI && query ? new URL(`?${query}`, redirectURI).href : '',
      }),
    );
  });
});
