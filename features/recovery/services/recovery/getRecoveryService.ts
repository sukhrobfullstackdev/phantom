import { MagicAPIResponse } from '~/shared/types/magic-api-response';
import { HttpService } from '~/app/services/http';
import { RecoveryMethodType } from '~/features/recovery/constants/flags';

/**
 * getRecoveryFactor
 */
export type RecoveryFactor = {
  auth_user_id: string;
  is_active: boolean;
  id: string;
  is_recovery_enabled: boolean;
  time_created: number;
  time_updated: number;
  time_verified: number;
  type: RecoveryMethodType;
  value: string;
};
interface GetRecoveryFactorResponse extends MagicAPIResponse<[RecoveryFactor]> {}

export function getRecoveryFactor(userId) {
  const endpoint = `/v1/auth/user/factor?auth_user_id=${userId}`;

  return HttpService.magic.get<GetRecoveryFactorResponse>(endpoint);
}
