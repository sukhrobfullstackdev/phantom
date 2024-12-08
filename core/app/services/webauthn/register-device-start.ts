import { HttpService } from '../http';
import { MagicAPIResponse } from '~/shared/types/magic-api-response';

type WebauthnDevicyRegistrationStartResponse = MagicAPIResponse<{
  credential_options: any;
}>;

export async function registerDeviceStart(auth_user_id: string) {
  const endpoint = `v1/auth/user/web_authn/device/registration/start?auth_user_id=${auth_user_id}`;

  return HttpService.magic.get<WebauthnDevicyRegistrationStartResponse>(endpoint);
}
