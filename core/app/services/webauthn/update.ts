import { HttpService } from '../http';

interface WebAuthnUpdateBody {
  nickname: string;
  webauthn_id: string;
  auth_user_id: string;
}

export async function update(auth_user_id: string, webauthn_id: string, nickname: string) {
  const endpoint = `v1/auth/user/web_authn/info/update`;

  const body = {
    auth_user_id,
    webauthn_id,
    nickname,
  };

  return HttpService.magic.post<WebAuthnUpdateBody>(endpoint, body);
}
