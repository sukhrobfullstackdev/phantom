import { Request } from 'express';
import { HttpService, withXForwardedFor } from '~/server/services/http';
import { pickBy } from '~/shared/libs/object-helpers';
import { CSPSource } from '~/shared/types/client-config-response';
import { MagicAPIResponse } from '~/shared/types/magic-api-response';

type CSPResourceResponse = MagicAPIResponse<[CSPSource]>;

/**
 * Retrieves the CSP information associated with the current API key. This is intended to be called from the iframed context built via the SDK.
 */
export function getCSPResource(apiKey: string, req: Request) {
  const endpoint = `/v1/api/magic_client/csp_source`;
  return HttpService.internalMagic.get<CSPResourceResponse>(endpoint, {
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
