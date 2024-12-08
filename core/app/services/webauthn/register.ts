import { HttpService } from '../http';

interface WebAuthnRegisterBody {
  webauthn_user_id: string;
  nickname: string;
  transport: string;
  user_agent: string;
  registration_response: any;
}

export async function register(
  webauthn_user_id: string,
  nickname = '',
  transport: string,
  user_agent: string,
  registration_response: any,
) {
  const endpoint = `v1/auth/user/web_authn/register`;

  const body: WebAuthnRegisterBody = {
    webauthn_user_id,
    nickname,
    transport,
    user_agent,
    registration_response,
  };

  return HttpService.magic.post<WebAuthnRegisterBody>(endpoint, body) as any;
}
