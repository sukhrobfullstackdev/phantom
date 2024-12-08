import { MagicAPIResponse } from '~/shared/types/magic-api-response';
import { HttpService } from '../http';

type ConfirmActionStatusResponse = MagicAPIResponse<{
  status: string;
}>;

export function getConfirmStatus(auth_user_id: string, confirmation_id: string) {
  const endpoint = `/v1/core/user/action/confirm/status?auth_user_id=${auth_user_id}&confirmation_id=${confirmation_id}`;
  return HttpService.magic.get<ConfirmActionStatusResponse>(endpoint);
}
