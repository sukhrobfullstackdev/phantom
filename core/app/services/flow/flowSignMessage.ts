import { HttpService } from '../http';

export function flowSeedWallet(auth_user_id: string, encoded_public_key, network): Promise<any> {
  const endpoint = `v1/auth/user/wallet/flow/seed`;

  const body = { auth_user_id, encoded_public_key, network };

  return HttpService.magic.post(endpoint, body);
}
