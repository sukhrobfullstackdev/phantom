import { handler } from './handler-factory';
import { RefreshTokenService } from '../services/refresh-token';
import { withFields } from './with-fields';
import { requireHeaders } from './require-headers';
import { createResponseJson } from '../libs/response';
import { coreHttpErrors } from '../libs/exceptions';
import { CookieService } from '../services/cookies';
import { REFRESH_TOKEN_COOKIE, CSRF_TOKEN_COOKIE } from '~/shared/constants/cookies';
import { composeMiddleware } from './compose-middleware';

interface SetRefreshCookiesFields {
  auth_user_id: string;
  request_origin_message: string;
}

/**
 * Persist session refresh cookies via an internal API call.
 */
export const persistSession = composeMiddleware(
  requireHeaders(['x-magic-api-key', 'x-magic-referrer', 'authorization']),
  withFields<SetRefreshCookiesFields>(['auth_user_id', 'request_origin_message'])(data => {
    return handler(async (req, res) => {
      const { auth_user_refresh_token, auth_user_csrf, refresh_token_period_in_days } = (
        await RefreshTokenService.createRefreshToken(data.auth_user_id, data.request_origin_message, req)
      ).data;

      const maxAge = refresh_token_period_in_days * 24 * 60 * 60 * 1000;

      CookieService.set(res, REFRESH_TOKEN_COOKIE, auth_user_refresh_token, { maxAge });
      CookieService.set(res, CSRF_TOKEN_COOKIE, auth_user_csrf, { maxAge });

      res.status(200).json(createResponseJson());
    });
  }),
);

/**
 * Determines if the minimum required datas are attached to `req` to enable
 * session refresh.
 */
const checkIfRefreshIsPossible = handler((req, res, next) => {
  // if (!req.ext.signedCookies._aurt || !req.ext.cookies._aucsrf) {
  //   CookieService.clear(res, REFRESH_TOKEN_COOKIE);
  //   CookieService.clear(res, CSRF_TOKEN_COOKIE);
  //   throw coreHttpErrors.UnableToRefreshSession();
  // }

  next();
});

/**
 * Hydrate the session from existing session refresh cookies.
 */
export const hydrateSession = composeMiddleware(
  checkIfRefreshIsPossible,
  // requireHeaders(['x-magic-api-key', 'x-magic-referrer']),
  handler(async (req, res) => {
    const tradeRefreshTokenResData = (
      await RefreshTokenService.tradeRefreshToken(req.ext.signedCookies._aurt!, req).catch(reason => {
        CookieService.clear(res, REFRESH_TOKEN_COOKIE);
        CookieService.clear(res, CSRF_TOKEN_COOKIE);

        throw reason;
      })
    ).data;

    res.status(200).json(createResponseJson(tradeRefreshTokenResData));
  }),
);
