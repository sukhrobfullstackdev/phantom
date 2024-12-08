import { Request } from 'express';
import { pickBy } from '~/shared/libs/object-helpers';
import { MagicAPIResponse } from '~/shared/types/magic-api-response';
import { HttpService, withXForwardedFor } from '../http';

interface TradeRefreshTokenBody {
  auth_user_refresh_token: string;
}

type TradeRefreshTokenResponse = MagicAPIResponse<{
  auth_user_session_token: string;
  auth_user_id: string;
  email: string;
  phone_number: string;
}>;

export function tradeRefreshToken(refreshToken: string, req: Request) {
  const endpoint = `/internal/auth/user/session/refresh/v1`;

  const body: TradeRefreshTokenBody = {
    auth_user_refresh_token: refreshToken,
  };

  return HttpService.internalMagic.post<TradeRefreshTokenBody, TradeRefreshTokenResponse>(endpoint, body, {
    headers: pickBy(
      withXForwardedFor(
        {
          'x-magic-api-key': req.headers['x-magic-api-key'],
          'x-magic-referrer': req.headers['x-magic-referrer'],
          'x-magic-csrf': req.headers['x-magic-csrf'],
          'x-magic-trace-id': req.headers['x-magic-trace-id'],
          'accept-language': req.headers['accept-language'],
          'x-magic-bundle-id': req.headers['x-magic-bundle-id'],
          'x-custom-authorization-token': req.headers['x-custom-authorization-token'],
        },
        req,
      ),
    ),
  });
}
