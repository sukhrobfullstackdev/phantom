/* eslint-disable prefer-promise-reject-errors */
import qs from 'qs';
import { MagicAPIResponse } from '~/shared/types/magic-api-response';
import { HttpService } from '~/app/services/http';
import { RecoveryMethodType } from '~/features/recovery/constants/flags';
import { SetupRecoveryFactorBody } from '~/features/recovery/services/recovery/setupRecoveryService';
import { AuthUserFactorResponseType } from '~/features/recency-check/services/verifyPrimaryFactorService';

/**
 * Delete Recovery Factor
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

export function deleteRecoveryFactor(factor_id: string, auth_user_id: string) {
  const query = qs.stringify({ auth_user_id });
  const endpoint = `/v1/auth/user/factor/${factor_id}?${query}`;

  return HttpService.magic.delete<UseRecoveryFactorAttemptStartResponse>(endpoint);
}

/**
 * Patch Recovery Factor
 */

type PatchRecoveryFactorResponse = MagicAPIResponse<AuthUserFactorResponseType>;

export function patchRecoveryFactor(factor_id, body) {
  const endpoint = `/v1/auth/user/factor/${factor_id}`;

  return HttpService.magic.patch<SetupRecoveryFactorBody, PatchRecoveryFactorResponse>(endpoint, body);
}
