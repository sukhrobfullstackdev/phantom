import { ConfirmActionInfo, ConfirmActionType } from '~/features/confirm-action/types';
import { HttpService } from '../http';
import { MagicAPIResponse } from '~/shared/types/magic-api-response';

type BeginConfirmActionResponse = MagicAPIResponse<{
  confirmation_id: string;
  temporary_confirmation_token: string;
}>;

interface BeginConfirmBody {
  auth_user_id: string;
  action: ConfirmActionType;
  payload: ConfirmActionInfo;
}

export function beginConfirm(auth_user_id: string, action: ConfirmActionType, payload: any) {
  const endpoint = `/v1/core/user/action/confirm/begin`;

  const body: BeginConfirmBody = {
    auth_user_id,
    action,
    payload,
  };
  return HttpService.magic.post<BeginConfirmBody, BeginConfirmActionResponse>(endpoint, body);
}
