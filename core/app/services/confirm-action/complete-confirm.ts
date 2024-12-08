import { MagicAPIResponse } from '~/shared/types/magic-api-response';
import { HttpService } from '../http';

interface ConfirmCompleteBody {
  temporary_confirmation_token: string;
  result: 'APPROVED' | 'REJECTED';
}

export enum ConfirmResponse {
  Approved = 'APPROVED',
  Rejected = 'REJECTED',
}

export function completeConfirm(
  temporary_confirmation_token: string,
  api_key: string,
  confirm_response: ConfirmResponse,
) {
  const endpoint = `/v1/core/user/action/confirm/complete`;

  const body: ConfirmCompleteBody = {
    temporary_confirmation_token,
    result: confirm_response,
  };
  const config = {
    headers: {
      'x-magic-api-key': api_key,
    },
  };
  return HttpService.magic.post<ConfirmCompleteBody, MagicAPIResponse>(endpoint, body, config);
}
