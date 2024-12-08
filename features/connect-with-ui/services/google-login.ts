/* eslint-disable prefer-promise-reject-errors */
import { getHeaders } from '~/app/libs/connect-utils';
import { MfaInfoData } from '~/app/services/authentication/mfa-types';
import { HttpService } from '~/app/services/http';
import { MagicAPIResponse } from '~/shared/types/magic-api-response';

interface LoginStartGoogleOauth {
  request_origin_message: string;
  token: string;
}

interface LoginStartGoogleOauthResponse extends MagicAPIResponse<{} & MfaInfoData> {}

export function loginStartGoogleOauth(request_origin_message: string, token: string) {
  const endpoint = `/v1/connect/user/login/jwt/start/google`;

  const body: LoginStartGoogleOauth = {
    token,
    request_origin_message,
  };

  return HttpService.magic.post<LoginStartGoogleOauth, LoginStartGoogleOauthResponse>(endpoint, body, getHeaders());
}

interface LoginVerifyGoogleOauth {
  request_origin_message: string;
  login_flow_context: string;
}

interface LoginVerifyGoogleOauthResponse
  extends MagicAPIResponse<
    {
      auth_user_id: string;
      auth_user_session_token: string;
      refresh_token: string;
    } & MfaInfoData
  > {}

export function loginVerifyGoogleOauth(request_origin_message: string, login_flow_context: string) {
  const endpoint = `/v1/connect/user/login/jwt/verify`;

  const body: LoginVerifyGoogleOauth = {
    login_flow_context,
    request_origin_message,
  };

  return HttpService.magic.post<LoginVerifyGoogleOauth, LoginVerifyGoogleOauthResponse>(endpoint, body, getHeaders());
}
