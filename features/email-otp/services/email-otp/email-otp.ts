import { isGlobalAppScope, setGlobalAppScopeHeaders } from '~/app/libs/connect-utils';
import { MfaInfoData } from '~/app/services/authentication/mfa-types';
import { MagicAPIResponse } from '~/shared/types/magic-api-response';
import { HttpService } from '../../../../core/app/services/http';
import * as errorCodes from './errorCodes';
import { INCORRECT_VERIFICATION_CODE } from './errorCodes';
import { createJwtWithIframeKP, setDpopHeader } from '~/app/libs/webcrypto/dpop-utils';
import { signIframeUA } from '~/app/libs/webcrypto/ua-sig';

interface LoginWithEmailOtpStartBody {
  email: string;
  request_origin_message: string;
  overrides?: {
    variation?: string;
  };
}

type LoginWithEmailOtpStartResponse = MagicAPIResponse<
  {
    utc_timestamp_ms: number;
    utc_otc_expiry_ms: number;
    utc_retrygate_ms: number;
  } & MfaInfoData
>;

export async function loginWithEmailOtpStart(
  email: string,
  request_origin_message: string,
  version: string,
  jwt?: string,
  overrides?: { variation: string },
) {
  const base = isGlobalAppScope() ? '/v1/connect' : `/${version}/auth`;
  const endpoint = `${base}/user/login/email_otp/start`;

  const body: LoginWithEmailOtpStartBody = {
    email,
    request_origin_message,
    overrides,
  };

  const headers = {
    headers: {
      ...setDpopHeader(await createJwtWithIframeKP(jwt)),
      ...setGlobalAppScopeHeaders(),
      'ua-sig': await signIframeUA(),
    },
  };

  const res = await HttpService.magic.post<LoginWithEmailOtpStartBody, LoginWithEmailOtpStartResponse>(
    endpoint,
    body,
    headers,
  );

  return res;
}

interface LoginWithEmailOtpVerifyBody {
  email: string;
  request_origin_message: string;
  one_time_code: string;
  login_flow_context: string;
}

type LoginWithEmailOtpVerifyResponse = MagicAPIResponse<
  {
    auth_user_id: string;
    auth_user_session_token: string;
    refresh_token: string;
  } & MfaInfoData
>;

export type LoginWithEmailOtpVerifyOptions = {
  email: string;
  rom: string;
  otc: string;
  loginFlowContext: string;
  jwt?: string;
};

export function loginWithEmailOtpVerify({
  email,
  rom: request_origin_message,
  otc: one_time_code,
  jwt,
  loginFlowContext: login_flow_context,
}: LoginWithEmailOtpVerifyOptions) {
  const endpoint = `/v1/auth/user/login/email_otp/verify`;

  const body: LoginWithEmailOtpVerifyBody = {
    email,
    request_origin_message,
    one_time_code,
    login_flow_context,
  };

  const headers = {
    headers: {
      ...setDpopHeader(jwt),
    },
  };

  return HttpService.magic.post<LoginWithEmailOtpVerifyBody, LoginWithEmailOtpVerifyResponse>(endpoint, body, headers);
}

export function isLoginWithEmailOtpErrorCode(code) {
  return errorCodes[code];
}

export function isCorrectVerificationCodeError(code) {
  return code === INCORRECT_VERIFICATION_CODE;
}
