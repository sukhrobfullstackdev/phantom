import { getHeaders } from '~/app/libs/connect-utils';
import { HttpService } from '../http';

interface GetJwtBody {
  auth_user_id: string;
  wallet_type: string;
  scheme_metadata: object;
}

export const getJwt = (auth_user_id, wallet_type, scheme_metadata) => {
  const endpoint = '/v1/core/user/token';

  const body = { auth_user_id, wallet_type, scheme_metadata };

  return HttpService.magic.post<GetJwtBody>(endpoint, body, getHeaders());
};
