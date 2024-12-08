import { HttpService } from '../http';

interface WebauthnReAuthStartRequestBody {
  username: string;
}

export function webAuthnReAuthStart(username: string): Promise<any> {
  const endpoint = `v1/auth/user/web_authn/re_auth/start`;

  const body = { username };

  return HttpService.magic.post<WebauthnReAuthStartRequestBody>(endpoint, body);
}
