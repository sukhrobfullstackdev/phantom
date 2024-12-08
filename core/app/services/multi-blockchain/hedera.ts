import { HttpService } from '../http';

export function hederaSignMessage(auth_user_id: string, message: string): Promise<any> {
  const endpoint = `v1/auth/user/wallet/hedera/message/sign`;

  const body = { auth_user_id, message };

  return HttpService.magic.post(endpoint, body);
}
