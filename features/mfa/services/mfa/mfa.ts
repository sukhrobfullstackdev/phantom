/* eslint-disable prefer-promise-reject-errors */
import { setDpopHeader } from '~/app/libs/webcrypto/dpop-utils';
import { MagicAPIResponse } from '~/shared/types/magic-api-response';
import { HttpService } from '../../../../core/app/services/http';
import * as errorCodes from './errorCodes';

interface StartTotpEnrollBody {
  auth_user_id: string;
}

type StartTotpEnrollResponse = MagicAPIResponse<{
  secret: string;
  mfa_info: string;
}>;

export function startTotpEnroll(auth_user_id: string) {
  const endpoint = `/v1/auth/user/enroll/totp/create`;

  const body: StartTotpEnrollBody = {
    auth_user_id,
  };

  return HttpService.magic.post<StartTotpEnrollBody, StartTotpEnrollResponse>(endpoint, body);
}

interface FinishTotpEnrollBody {
  auth_user_id: string;
  mfa_info: string;
  one_time_code: string;
}

type FinishTotpEnrollResponse = MagicAPIResponse<{
  recovery_codes: Array<string>;
}>;

export function finishTotpEnroll(auth_user_id: string, mfa_info: string, one_time_code: string) {
  const endpoint = `/v1/auth/user/enroll/totp/enable`;

  const body: FinishTotpEnrollBody = {
    auth_user_id,
    mfa_info,
    one_time_code,
  };

  return HttpService.magic.post<FinishTotpEnrollBody, FinishTotpEnrollResponse>(endpoint, body);
}

export function isMfaErrorCode(code) {
  return errorCodes[code];
}

interface DisableTotpBody {
  auth_user_id: string;
  one_time_code: string;
}

export function disableTotp(auth_user_id: string, one_time_code: string) {
  const endpoint = `/v1/auth/user/enroll/totp/disable`;

  const body: DisableTotpBody = {
    auth_user_id,
    one_time_code,
  };

  return HttpService.magic.post<DisableTotpBody, MagicAPIResponse>(endpoint, body);
}

interface DisableCodesBody {
  auth_user_id: string;
  recovery_code: string;
}

export function disableTotpRecoveryCode(auth_user_id: string, recovery_code: string) {
  const endpoint = `/v1/auth/user/enroll/codes/disable`;

  const body: DisableCodesBody = {
    auth_user_id,
    recovery_code,
  };

  return HttpService.magic.post<DisableCodesBody, MagicAPIResponse>(endpoint, body);
}

export type MfaVerifySuccessData = {
  auth_user_id: string;
  refresh_token: string;
  auth_user_session_token: string;
};

type MfaVerifyResponse = MagicAPIResponse<MfaVerifySuccessData>;
interface MfaVerifyTotpBody {
  one_time_code: string;
  login_flow_context: string;
}

export function mfaVerifyTotp(login_flow_context: string, one_time_code: string, jwt?: string) {
  const endpoint = `/v1/auth/user/login/totp/verify`;

  const body: MfaVerifyTotpBody = {
    login_flow_context,
    one_time_code,
  };

  return HttpService.magic.post<MfaVerifyTotpBody, MfaVerifyResponse>(endpoint, body, {
    headers: {
      ...setDpopHeader(jwt),
    },
  });
}

interface MfaVerifyCodesBody {
  recovery_code: string;
  login_flow_context: string;
}

export function mfaVerifyCodes(login_flow_context: string, recovery_code: string, jwt?: string) {
  const endpoint = `/v1/auth/user/login/codes/verify`;

  const body: MfaVerifyCodesBody = {
    login_flow_context,
    recovery_code,
  };

  return HttpService.magic.post<MfaVerifyCodesBody, MfaVerifyResponse>(endpoint, body, {
    headers: {
      ...setDpopHeader(jwt),
    },
  });
}
