import { setDpopHeader } from '~/app/libs/webcrypto/dpop-utils';
import { HttpService } from '~/app/services/http';
import { MagicAPIResponse } from '~/shared/types/magic-api-response';

type GetOauthAppResponse = MagicAPIResponse<{
  id: string;
  app_id: string;
  redirect_id: string;
}>;

export async function getOauthApp(provider: string, jwt?: string): Promise<GetOauthAppResponse> {
  const endpoint = `/v1/api/magic_client/oauth_app?provider_name=${provider}`;
  return HttpService.magic.get<GetOauthAppResponse>(endpoint, {
    headers: {
      ...setDpopHeader(jwt),
    },
  });
}
