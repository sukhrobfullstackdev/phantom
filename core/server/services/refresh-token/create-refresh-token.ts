import { Request } from 'express';
import { pickBy } from '~/shared/libs/object-helpers';
import { MagicAPIResponse } from '~/shared/types/magic-api-response';
import { HttpService, withXForwardedFor } from '../http';

interface CreateRefreshTokenBody {
  auth_user_id: string;
  request_origin_message: string;
}

type CreateRefreshTokenResponse = MagicAPIResponse<{
  auth_user_refresh_token: string;
  auth_user_csrf: string;
  refresh_token_period_in_days: number;
}>;

export function createRefreshToken(userID: string, requestOriginMessage: string, req: Request) {
  const endpoint = `/internal/auth/user/refresh_token/create/v1`;

  const body: CreateRefreshTokenBody = {
    auth_user_id: userID,
    request_origin_message: requestOriginMessage,
  };

  return HttpService.internalMagic.post<CreateRefreshTokenBody, CreateRefreshTokenResponse>(endpoint, body, {
    headers: pickBy(
      withXForwardedFor(
        {
          authorization: req.headers.authorization,
          'x-magic-api-key': req.headers['x-magic-api-key'],
          'x-magic-referrer': req.headers['x-magic-referrer'],
          'x-magic-trace-id': req.headers['x-magic-trace-id'],
          'x-magic-bundle-id': req.headers['x-magic-bundle-id'],
          'accept-language': req.headers['accept-language'],
        },
        req,
      ),
    ),
  });
}
