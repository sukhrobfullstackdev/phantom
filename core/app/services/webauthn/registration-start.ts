import { HttpService } from '../http';
import { MagicAPIResponse } from '~/shared/types/magic-api-response';

type WebauthnRegistrationStartResponse = MagicAPIResponse<{
  credential_options: any;
  webauthn_user_id: string;
}>;
interface WebauthnRegistrationStartRequestBody {
  username: string;
}

export async function registrationStart(username: string) {
  const endpoint = `v1/auth/user/web_authn/registration/start`;

  const body = {
    username,
  };

  return HttpService.magic.post<WebauthnRegistrationStartRequestBody, WebauthnRegistrationStartResponse>(
    endpoint,
    body,
  );
}
