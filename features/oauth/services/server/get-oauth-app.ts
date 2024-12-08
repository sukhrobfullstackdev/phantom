import { Request } from 'express';
import qs from 'qs';
import { PlatformType } from '~/features/oauth/types/oauth-metadata';
import { getReferrerFromHeaders } from '~/server/libs/get-referrer-from-headers';
import { HttpService, withXForwardedFor } from '~/server/services/http';
import { pickBy } from '~/shared/libs/object-helpers';
import { MagicAPIResponse } from '~/shared/types/magic-api-response';

type GetOAuthAppResponse = MagicAPIResponse<{
  oauth_app_id: string; // OAuth client DB reference
  oauth_redirect_id: string;
  app_id: string;
  app_secret: string;
}>;

export function getOAuthApp(
  provider: string,
  apiKey: string,
  req: Request,
  platform?: PlatformType,
  bundleId?: string,
) {
  const queryString = qs.stringify({ provider_name: provider });
  const endpoint = `/internal/oauth/app/get/v1?${queryString}`;

  return HttpService.internalMagic.get<GetOAuthAppResponse>(endpoint, {
    headers: pickBy(
      withXForwardedFor(
        {
          'x-magic-api-key': apiKey,
          'x-magic-trace-id': req.headers['x-magic-trace-id'],
          'accept-language': req.headers['accept-language'],
          'x-magic-referrer': getReferrerFromHeaders(req, platform),
          'x-magic-bundle-id': bundleId,
        },
        req,
      ),
    ),
  });
}
