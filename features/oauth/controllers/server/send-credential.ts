import qs from 'qs';
import { URL } from 'url';
import { composeMiddleware } from '~/server/middlewares/compose-middleware';
import { handler } from '~/server/middlewares/handler-factory';
import { coreHttpErrors } from '~/server/libs/exceptions';
import { withFields } from '~/server/middlewares/with-fields';
import { normalizeOAuthScope } from '~/features/oauth/libs/format-oauth-scope';
import {
  CUSTOM_THEME_COOKIE,
  LOGIN_FLOW_CONTEXT_COOKIE,
  MFA_FACTORS_REQUIRED_COOKIE,
  OAUTH_CLIENT_META_COOKIE,
  OAUTH_REQUEST_ID_COOKIE,
  OAUTH_SERVER_META_COOKIE,
} from '~/shared/constants/cookies';
import { CookieService } from '~/server/services/cookies';
import { createResponseJson } from '~/server/libs/response';
import { serverLogger } from '~/server/libs/datadog';

interface SendCredentialFields {
  magic_credential: string;
}

const sendCredentialFields = withFields<SendCredentialFields>(['magic_credential']);

/**
 * Before the final redirect can be processed, we have to make sure the metadata
 * cookies set during the authorization/callback steps are present, valid, and
 * un-tampered. Because we sign/encrypt these cookies, they will be falesy if
 * parsing fails.
 */
const ensureMetadataCookiePresenceAndIntegrity = handler((req, res, next) => {
  if (!req.ext.signedCookies._oaservermeta || !req.ext.signedCookies._oarid) {
    serverLogger.error('OAuth Error OAuthCookieSignatureError', {
      signedCookies: req.ext.signedCookies,
    });
    throw coreHttpErrors.OAuthCookieSignatureError();
  }

  next();
});

/**
 * Completes the final redirect back to the developer's own client application.
 * The information encoded into the URI query can be traded via the Auth Relayer
 * <iframe> to receive the OAUth access token and user's DID Token.
 */
const createResponseForDeveloperClient = sendCredentialFields(data =>
  handler(async (req, res) => {
    const originalRedirectURI = req.ext.signedCookies._oaservermeta?.magic_redirect_uri;
    const platform = req.ext.signedCookies._oaservermeta?.platform;

    const query = qs.stringify({
      provider: req.ext.signedCookies._oaservermeta?.provider,
      state: req.ext.signedCookies._oaservermeta?.oauth_state,
      scope: normalizeOAuthScope(req.ext.signedCookies._oaservermeta?.oauth_scope),
      magic_oauth_request_id: req.ext.signedCookies._oarid,
      magic_credential: data.magic_credential,
    });

    // overwrites query in the redirectURI
    const redirectURIWithCredential = new URL(<string>originalRedirectURI);

    redirectURIWithCredential.searchParams.set('provider', <string>req.ext.signedCookies._oaservermeta?.provider);
    redirectURIWithCredential.searchParams.set('state', <string>req.ext.signedCookies._oaservermeta?.oauth_state);
    redirectURIWithCredential.searchParams.set(
      'scope',
      normalizeOAuthScope(req.ext.signedCookies._oaservermeta?.oauth_scope),
    );
    redirectURIWithCredential.searchParams.set('magic_oauth_request_id', <string>req.ext.signedCookies._oarid);
    redirectURIWithCredential.searchParams.set('magic_credential', data.magic_credential);

    CookieService.clear(res, OAUTH_CLIENT_META_COOKIE);
    CookieService.clear(res, OAUTH_SERVER_META_COOKIE);
    CookieService.clear(res, OAUTH_REQUEST_ID_COOKIE);
    CookieService.clear(res, CUSTOM_THEME_COOKIE);
    CookieService.clear(res, LOGIN_FLOW_CONTEXT_COOKIE);
    CookieService.clear(res, MFA_FACTORS_REQUIRED_COOKIE);

    res.status(200).json(
      createResponseJson({
        platform,
        query,
        redirectURI: originalRedirectURI ? redirectURIWithCredential : '',
      }),
    );
  }),
);

/**
 * Redirects the "magic_credential" and OAuth request ID back to the developer.
 */
export const oauthSendCredentialViaQueryParameters = composeMiddleware(
  ensureMetadataCookiePresenceAndIntegrity,
  createResponseForDeveloperClient,
);
