/* eslint-disable prefer-promise-reject-errors */
import { MagicAPIResponse } from '~/shared/types/magic-api-response';
import { HttpService } from '~/app/services/http';
import { RecoveryMethodType } from '~/features/recovery/constants/flags';

/**
 * Step 1 useRecoveryFactorAttemptStart
 */
type UseRecoveryFactorAttemptStartResponse = MagicAPIResponse<
  [
    {
      type: RecoveryMethodType;
      value: string;
      factor_id: string;
    },
  ]
>;

export function recoveryFactorAttemptStart(email: string) {
  const endpoint = `/v1/auth/user/recovery/challenge?email=${encodeURIComponent(email)}`;

  return HttpService.magic.get<UseRecoveryFactorAttemptStartResponse>(endpoint);
}

/**
 * Step 2
 * RecoveryFactorAttemptChallenge
 */
interface UseRecoveryFactorAttemptChallengeBody {
  factor_id: string;
}

export type RecoveryChallengeResponseType = {
  attempt_id: string;
};

type UseRecoveryFactorAttemptChallengeResponse = MagicAPIResponse<RecoveryChallengeResponseType>;

export function recoveryFactorAttemptChallenge(factor_id: string) {
  const endpoint = `/v1/auth/user/recovery/challenge`;
  const body: UseRecoveryFactorAttemptChallengeBody = {
    factor_id,
  };

  return HttpService.magic.post<UseRecoveryFactorAttemptChallengeBody, UseRecoveryFactorAttemptChallengeResponse>(
    endpoint,
    body,
  );
}

/**
 * Step 3
 * RecoveryFactorAttemptVerify
 */
interface UseRecoveryFactorAttemptVerifyBody {
  attempt_id: string;
  response: string;
}

type UseRecoveryFactorAttemptVerifyResponse = MagicAPIResponse<{
  auth_user_id: string;
  auth_user_session_token: string;
  refresh_token: string;
  credential: string;
}>;

export function recoveryFactorAttemptVerify(attempt_id: string, response: string) {
  const endpoint = `/v1/auth/user/recovery/verify`;

  const body: UseRecoveryFactorAttemptVerifyBody = {
    attempt_id,
    response,
  };

  return HttpService.magic.post<UseRecoveryFactorAttemptVerifyBody, UseRecoveryFactorAttemptVerifyResponse>(
    endpoint,
    body,
  );
}
