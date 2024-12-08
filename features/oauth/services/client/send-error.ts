import { HttpService } from '~/app/services/http';
import { MagicAPIResponse } from '~/shared/types/magic-api-response';
import { PlatformType } from '~/features/oauth/types/oauth-metadata';

interface OAuthSendCredentialResponse
  extends MagicAPIResponse<{
    platform: PlatformType;
    query: string;
    redirectURI: string;
  }> {}

export function sendError(errorQuery: string) {
  const endpoint = `/v1/oauth2/error/send?${errorQuery}`;

  return HttpService.authRelayer.get<OAuthSendCredentialResponse>(endpoint);
}
