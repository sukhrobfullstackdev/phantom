import { HttpService } from '../http';

interface WebAuthnRegisterBody {
  auth_user_id: string;
  nickname: string;
  transport: string;
  user_agent: string;
  registration_response: any;
}

export async function registerDevice(
  auth_user_id: string,
  nickname = '',
  transport: string,
  user_agent: string,
  registration_response: any,
) {
  const endpoint = `v1/auth/user/web_authn/device/register`;

  const body: WebAuthnRegisterBody = {
    auth_user_id,
    nickname,
    transport,
    user_agent,
    registration_response,
  };

  return HttpService.magic.post<WebAuthnRegisterBody>(endpoint, body) as any;
}
