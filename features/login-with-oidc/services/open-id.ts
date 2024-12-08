/* eslint-disable prefer-promise-reject-errors */
import { MfaInfoData } from '~/app/services/authentication/mfa-types';
import { HttpService } from '~/app/services/http';
import { MagicAPIResponse } from '~/shared/types/magic-api-response';

interface LoginOpenIdRequest {
  token: string;
  provider_id: string;
}

interface LoginOpenIdResponse
  extends MagicAPIResponse<
    {
      auth_user_id: string;
      auth_user_session_token: string;
      refresh_token: string;
    } & MfaInfoData
  > {}

export function loginWithOIDC(provider_id: string, token: string) {
  const endpoint = `/v1/auth/user/login/jwt/verify`;

  const body: LoginOpenIdRequest = {
    token,
    provider_id,
  };

  return HttpService.magic.post<LoginOpenIdRequest, LoginOpenIdResponse>(endpoint, body);
}
