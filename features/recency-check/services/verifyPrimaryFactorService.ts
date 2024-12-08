import { MagicAPIResponse } from '~/shared/types/magic-api-response';
import { HttpService } from '~/app/services/http';
import { RecoveryMethodType } from '~/features/recovery/constants/flags';
import * as errorCodes from '~/features/recovery/services/recovery/errorCodes';

/**
 * setupRecoveryFactor
 */
export interface ProbeRecencyCheckBody {
  auth_user_id: string;
  value: string;
  type: RecoveryMethodType.EmailAddress;
  is_recovery_enabled: true;
}

export type AuthUserFactorResponseType = {
  auth_user_id: string;
  id: string;
  is_active: boolean;
  is_recovery_enabled: boolean;
  is_authentication_enabled: boolean;
  time_created: number;
  time_verified?: number;
  type: RecoveryMethodType;
  value: string;
};

type ProbeRecencyCheckResponse = MagicAPIResponse<AuthUserFactorResponseType>;

export function probeRecencyCheck(auth_user_id: string, value: string) {
  const endpoint = `/v1/auth/user/factor`;

  const body: ProbeRecencyCheckBody = {
    auth_user_id,
    value,
    type: RecoveryMethodType.EmailAddress,
    is_recovery_enabled: true,
  };

  return HttpService.magic.post<ProbeRecencyCheckBody, ProbeRecencyCheckResponse>(endpoint, body);
}

/**
 * setupRecoveryFactor
 */
export interface VerifyPrimaryFactorBody {
  auth_user_id: string;
  value: string;
  type: RecoveryMethodType;
}

type VerifyPrimaryFactorResponse = MagicAPIResponse<AuthUserFactorResponseType>;

export function primaryFactorStart(body: VerifyPrimaryFactorBody) {
  const endpoint = `/v1/auth/user/factor`;

  return HttpService.magic.post<VerifyPrimaryFactorBody, VerifyPrimaryFactorResponse>(endpoint, body);
}

/**
 * setupRecoveryFactorChallenge
 */
interface PrimaryFactorChallengeBody {
  factor_id: string;
  auth_user_id: string;
}

type FactorChallengeResponse = {
  attempt_id: string;
};

type PrimaryFactorChallengeResponse = MagicAPIResponse<FactorChallengeResponse>;

export function primaryFactorChallenge(factor_id: string, auth_user_id: string) {
  const endpoint = `/alpha/v1/factor/challenge`;

  const body: PrimaryFactorChallengeBody = {
    factor_id,
    auth_user_id,
  };

  return HttpService.magic.post<PrimaryFactorChallengeBody, PrimaryFactorChallengeResponse>(endpoint, body);
}

/**
 * RecoveryFactorAttemptVerify
 */
interface PrimaryFactorVerifyBody {
  attempt_id: string;
  response: string;
  auth_user_id: string;
}

type PrimaryFactorVerifyResponse = MagicAPIResponse<{
  factor_id: string;
  credential: string;
}>;

export function primaryFactorVerify(attempt_id: string, response: string, userId: string) {
  const endpoint = `/alpha/v1/factor/verify`;

  const body: PrimaryFactorVerifyBody = {
    attempt_id, // factor id
    response,
    auth_user_id: userId,
  };

  return HttpService.magic.post<PrimaryFactorVerifyBody, PrimaryFactorVerifyResponse>(endpoint, body);
}

export function isRecoveryErrorCode(code) {
  return errorCodes[code];
}
