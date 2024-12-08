import { MfaInfoData } from '~/app/services/authentication/mfa-types';
import { MagicAPIResponse } from '~/shared/types/magic-api-response';
import { HttpService } from '~/app/services/http';
import * as errorCodes from './errorCodes';
import { createJwtWithIframeKP, setDpopHeader } from '~/app/libs/webcrypto/dpop-utils';

interface LoginWithSmsStartBody {
  phone_number: string;
  request_origin_message: string;
  challenge: string;
}

type LoginWithSmsStartResponse = MagicAPIResponse<
  {
    utc_timestamp_ms: number;
    utc_otc_expiry_ms: number;
    utc_retrygate_ms: number;
  } & MfaInfoData
>;

export async function loginWithSmsStart(
  phone_number: string,
  request_origin_message: string,
  challenge: string,
  jwt?: string,
) {
  const endpoint = `/v1/auth/user/login/phone/start`;

  const body: LoginWithSmsStartBody = {
    phone_number,
    request_origin_message,
    challenge,
  };

  const headers = {
    headers: {
      ...setDpopHeader(await createJwtWithIframeKP(jwt)),
    },
  };

  const res = HttpService.magic.post<LoginWithSmsStartBody, LoginWithSmsStartResponse>(endpoint, body, headers);

  return res;
}

interface LoginWithSmsVerifyBody {
  phone_number: string;
  request_origin_message: string;
  one_time_code: string;
  login_flow_context: string;
}

type LoginWithSmsVerifyResponse = MagicAPIResponse<
  {
    auth_user_id: string;
    auth_user_session_token: string;
    refresh_token: string;
  } & MfaInfoData
>;

export type LoginWithSmsVerifyOptions = {
  phoneNumber: string;
  rom: string;
  otc: string;
  loginFlowContext: string;
  jwt?: string;
};

export function loginWithSmsVerify({
  phoneNumber: phone_number,
  rom: request_origin_message,
  otc: one_time_code,
  jwt,
  loginFlowContext: login_flow_context,
}: LoginWithSmsVerifyOptions) {
  const endpoint = `/v1/auth/user/login/phone/verify`;

  const body: LoginWithSmsVerifyBody = {
    phone_number,
    request_origin_message,
    one_time_code,
    login_flow_context,
  };

  const headers = {
    headers: {
      ...setDpopHeader(jwt),
    },
  };

  return HttpService.magic.post<LoginWithSmsVerifyBody, LoginWithSmsVerifyResponse>(endpoint, body, headers);
}

export function isLoginWithSmsErrorCode(code) {
  return errorCodes[code];
}
