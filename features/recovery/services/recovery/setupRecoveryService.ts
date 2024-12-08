/* eslint-disable prefer-promise-reject-errors */
import { MagicAPIResponse } from '~/shared/types/magic-api-response';
import { HttpService } from '~/app/services/http';
import { RecoveryMethodType } from '~/features/recovery/constants/flags';
import * as errorCodes from '~/features/recovery/services/recovery/errorCodes';
import { RecoveryChallengeResponseType } from '~/features/recovery/services/recovery/useRecoveryService';
import { AuthUserFactorResponseType } from '~/features/recency-check/services/verifyPrimaryFactorService';

/**
 * setupRecoveryFactor
 */
export interface SetupRecoveryFactorBody {
  auth_user_id: string;
  value: string;
  type: RecoveryMethodType;
  is_recovery_enabled?: boolean;
  credential?: string;
}

type SetupRecoveryFactorResponse = MagicAPIResponse<AuthUserFactorResponseType>;

export function setupRecoveryFactorStart(body: SetupRecoveryFactorBody) {
  const endpoint = `/v1/auth/user/factor`;

  return HttpService.magic.post<SetupRecoveryFactorBody, SetupRecoveryFactorResponse>(endpoint, body);
}

/**
 * setupRecoveryFactorChallenge
 */
interface SetupRecoveryFactorChallengeBody {
  factor_id: string;
  auth_user_id: string;
}

export type SetupRecoveryFactorChallengeResponse = MagicAPIResponse<{
  attempt_id: string;
}>;

export function setupRecoveryFactorChallenge(factor_id: string, auth_user_id: string) {
  const endpoint = `/alpha/v1/factor/challenge`;

  const body: SetupRecoveryFactorChallengeBody = {
    factor_id,
    auth_user_id,
  };

  return HttpService.magic.post<SetupRecoveryFactorChallengeBody, SetupRecoveryFactorChallengeResponse>(endpoint, body);
}

/**
 * RecoveryFactorAttemptVerify
 */
interface SetupRecoveryFactorVerifyBody {
  attempt_id: string;
  response: string;
  auth_user_id: string;
}

interface SetupRecoveryFactorVerifyResponse extends MagicAPIResponse<RecoveryChallengeResponseType> {
  attempt_id: string;
  credential: string;
  value: string;
}

export function setupRecoveryFactorVerify(attempt_id: string, response: string, userId: string) {
  const endpoint = `/alpha/v1/factor/verify`;

  const body: SetupRecoveryFactorVerifyBody = {
    attempt_id, // factor id
    response,
    auth_user_id: userId,
  };

  return HttpService.magic.post<SetupRecoveryFactorVerifyBody, SetupRecoveryFactorVerifyResponse>(endpoint, body);
}

export function isRecoveryErrorCode(code) {
  return errorCodes[code];
}
