import { HttpService } from '~/app/services/http';
import { MagicAPIResponse } from '~/shared/types/magic-api-response';
import { DeviceVerificationState } from '~/features/device-verification/service/device-verify';

interface DeviceApproveBody {
  action: string;
  token: string;
}
type DeviceApproveResponse = MagicAPIResponse;
type DeviceCheckResponse = MagicAPIResponse<DeviceVerificationState>;

export function deviceApprove(deviceProfileId: string, deviceToken: string, isApproved: boolean) {
  const endpoint = `/v1/auth/user/device_profile/${deviceProfileId}/review`;

  const body: DeviceApproveBody = {
    action: isApproved ? 'approve' : 'reject',
    token: deviceToken,
  };

  return HttpService.magic.post<DeviceApproveBody, DeviceApproveResponse>(endpoint, body);
}

export function deviceCheck(deviceProfileId: string) {
  const endpoint = `/v1/auth/user/device_profile/${deviceProfileId}`;
  return HttpService.magic.get<DeviceCheckResponse>(endpoint);
}
