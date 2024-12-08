import { Request } from 'express';
import { HttpService, withXForwardedFor } from '~/server/services/http';
import { pickBy } from '~/shared/libs/object-helpers';
import { ClientConfigInfo } from '~/shared/types/client-config-response';
import { MagicAPIResponse } from '~/shared/types/magic-api-response';

type GetClientConfigResponse = MagicAPIResponse<ClientConfigInfo>;

/**
 * Retrieves the client config information (client_theme, configured_auth_providers, premium_features, product_type, flags) associated with the current API key.
 * This is intended to be called from the iframed context built via the SDK.
 */
export function getClientConfig(apiKey: string, req: Request) {
  const endpoint = `v2/core/magic_client/config`;
  return HttpService.internalMagic.get<GetClientConfigResponse>(endpoint, {
    headers: pickBy(
      withXForwardedFor(
        {
          'x-magic-api-key': apiKey,
          'x-magic-trace-id': req.headers['x-magic-trace-id'],
          'accept-language': req.headers['accept-language'],
        },
        req,
      ),
    ),
  });
}
