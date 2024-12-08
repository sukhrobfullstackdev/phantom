import { setDpopHeader } from '~/app/libs/webcrypto/dpop-utils';
import { HttpService } from '~/app/services/http';
import { pickBy } from '~/shared/libs/object-helpers';
import { MagicAPIResponse } from '~/shared/types/magic-api-response';

interface GetAccessTokenBody {
  magic_oauth_request_id: string;
  magic_verifier: string;
}

type GetAccessTokenResponse = MagicAPIResponse<{
  auth_user_id: string;
  auth_user_session_token: string;
  access_token: string;
  provider_user_handle: string;
  refresh_token?: string;
}>;

export function getAccessToken(
  magicOAuthRequestID: string,
  magicVerifier: string,
  magicCredential: string,
  jwt?: string,
) {
  const endpoint = `/v2/oauth/user/verify`;

  const body: GetAccessTokenBody = {
    magic_oauth_request_id: magicOAuthRequestID,
    magic_verifier: magicVerifier,
  };

  return HttpService.magic.post<GetAccessTokenBody, GetAccessTokenResponse>(endpoint, body, {
    headers: {
      ...pickBy({
        authorization: magicCredential && `Bearer ${magicCredential}`,
      }),
      ...setDpopHeader(jwt),
    },
  });
}
