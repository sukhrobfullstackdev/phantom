import { Request } from 'express';
import qs from 'qs';
import { HttpService, withXForwardedFor } from '~/server/services/http';
import { pickBy } from '~/shared/libs/object-helpers';
import { MagicAPIResponse } from '~/shared/types/magic-api-response';

type GetOAuthUserResponse = MagicAPIResponse<{
  oauth_user_metadata: Record<string, any>;
}>;

export function getOAuthUser(provider: string, req: Request) {
  const queryString = qs.stringify({ provider_name: provider });
  const endpoint = `/internal/oauth/user/get/v1?${queryString}`;

  return HttpService.internalMagic.get<GetOAuthUserResponse>(endpoint, {
    headers: pickBy(
      withXForwardedFor(
        {
          authorization: req.headers.authorization,
          'x-magic-api-key': req.headers['x-magic-api-key'],
          'x-magic-trace-id': req.headers['x-magic-trace-id'],
          'accept-language': req.headers['accept-language'],
          'x-magic-referrer': req.headers['x-magic-referrer'] ?? req.headers.referer,
          'x-magic-bundle-id': req.headers['x-magic-bundle-id'],
        },
        req,
      ),
    ),
  });
}
