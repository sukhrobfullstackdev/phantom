import { HttpService } from '../http';

interface WebauthnReAuthVerifyRequestBody {
  username: string;
  assertion_response: any;
}

export function reauthVerify(username: string, assertion_response: any): Promise<any> {
  const endpoint = `v1/auth/user/web_authn/re_auth/verify`;

  const body = { username, assertion_response };

  return HttpService.magic.post<WebauthnReAuthVerifyRequestBody>(endpoint, body);
}
