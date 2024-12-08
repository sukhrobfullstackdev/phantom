import { HttpService } from '~/app/services/http';
import { MagicAPIResponse } from '~/shared/types/magic-api-response';
import { PlatformType } from '~/features/oauth/types/oauth-metadata';

interface OAuthSendCredentialResponse
  extends MagicAPIResponse<{
    platform: PlatformType;
    query: string;
    redirectURI: string;
  }> {}

export function sendCredential(resultQuery: string) {
  const endpoint = `/v1/oauth2/credential/send?${resultQuery}`;

  return HttpService.authRelayer.get<OAuthSendCredentialResponse>(endpoint);
}
