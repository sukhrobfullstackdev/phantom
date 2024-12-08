import { HttpService } from '../http';

export function getInfo(auth_user_id: any): Promise<any> {
  const endpoint = `v1/auth/user/web_authn/info/retrieve?auth_user_id=${auth_user_id}`;

  return HttpService.magic.get(endpoint);
}
