import { HttpService } from '../http';
import { MagicAPIResponse } from '~/shared/types/magic-api-response';
import { setDpopHeader } from '~/app/libs/webcrypto/dpop-utils';

interface GetRtUserSessionTokenBody {
  auth_user_refresh_token: string;
}

type GetRtUserSessionTokenResponse = MagicAPIResponse<{
  refresh_token: string;
  auth_user_session_token: string;
  auth_user_id: string;
  email: string;
  phone_number: string;
}>;

export function getUstWithRt(rt: string, jwt: string) {
  const endpoint = `/v1/auth/user/session/refresh`;

  const body: GetRtUserSessionTokenBody = {
    auth_user_refresh_token: rt,
  };

  const headers = {
    headers: {
      ...setDpopHeader(jwt),
    },
  };

  return HttpService.magic.post<GetRtUserSessionTokenBody, GetRtUserSessionTokenResponse>(endpoint, body, headers);
}
