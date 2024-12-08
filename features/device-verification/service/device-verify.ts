import { HttpService } from '~/app/services/http';
import { MagicAPIResponse } from '~/shared/types/magic-api-response';

export type DeviceVerificationState = { status: 'approved' | 'rejected' };

type DeviceVerifyResponse = MagicAPIResponse<DeviceVerificationState>;

export function deviceVerify(endpoint: string) {
  return HttpService.magic.get<DeviceVerifyResponse>(endpoint, {});
}
