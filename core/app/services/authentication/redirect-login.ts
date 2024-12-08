import { setDpopHeader } from '~/app/libs/webcrypto/dpop-utils';
import { pickBy } from '~/shared/libs/object-helpers';
import { MagicAPIResponse } from '~/shared/types/magic-api-response';
import { HttpService } from '../http';

type RedirectLoginResponse = MagicAPIResponse<{
  auth_user_id: string;
  auth_user_session_token: string;
  email: string;
  rom: string; // request origin message
  refresh_token?: string;
}>;

export function redirectLogin(magicCredential?: string, jwt?: string) {
  const endpoint = `v2/auth/user/redirect/login`;

  return HttpService.magic.post<undefined, RedirectLoginResponse>(endpoint, undefined, {
    headers: {
      ...pickBy({
        authorization: magicCredential && `Bearer ${magicCredential}`,
      }),
      ...setDpopHeader(jwt),
    },
  });
}
