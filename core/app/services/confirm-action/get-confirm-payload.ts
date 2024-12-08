import { MagicAPIResponse } from '~/shared/types/magic-api-response';
import { HttpService } from '../http';
import { ConfirmActionInfo } from '~/features/confirm-action/types';

type ConfirmPayloadResponse = MagicAPIResponse<{
  action: string;
  payload: ConfirmActionInfo;
}>;

type ConfirmPayloadBody = {
  temporary_confirmation_token: string;
};

export function getConfirmPayload(jwt: string) {
  const endpoint = `/v1/core/user/action/confirm/verify_token`;
  const body = {
    temporary_confirmation_token: jwt,
  };
  return HttpService.magic.post<ConfirmPayloadBody, ConfirmPayloadResponse>(endpoint, body);
}
