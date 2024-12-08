import { HttpService } from '../http';

interface WebAuthnUnregisterBody {
  auth_user_id: string;
  webauthn_id: string;
}

export async function unregister(auth_user_id: string, webauthn_id: string) {
  const endpoint = `v1/auth/user/web_authn/unregister`;

  const body = {
    auth_user_id,
    webauthn_id,
  };

  return HttpService.magic.post<WebAuthnUnregisterBody>(endpoint, body);
}
