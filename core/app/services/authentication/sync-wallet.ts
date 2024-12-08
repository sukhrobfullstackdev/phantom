import { HttpService } from '../http';
import { WalletType } from '../../constants/flags';
import { getHeaders, isGlobalAppScope } from '~/app/libs/connect-utils';
import { SplitkeyWalletInfo } from './get-user-info';

interface SyncWalletBody extends SplitkeyWalletInfo {
  auth_user_id: string;
  public_address: string;
  encrypted_private_address?: string;
  wallet_type: string;
  encrypted_seed_phrase?: string;
  hd_path?: string;
}

export function syncWallet(
  auth_user_id: string,
  public_address: string,
  wallet_type: string = WalletType.ETH,
  encrypted_private_address?: string,
  encrypted_magic_private_address_share?: string,
  encrypted_client_private_address_share?: string,
  encrypted_seed_phrase?: string,
  encrypted_magic_seed_phrase_share?: string,
  encrypted_client_seed_phrase_share?: string,
  hd_path?: string,
  client_share_metadata?: object,
) {
  const base = isGlobalAppScope() ? 'v1/connect' : 'v3/auth';
  const endpoint = `${base}/user/wallet/sync`;
  const body: SyncWalletBody = {
    auth_user_id,
    public_address,
    encrypted_private_address,
    encrypted_magic_private_address_share,
    encrypted_client_private_address_share,
    encrypted_client_private_address_share_metadata: client_share_metadata,
    wallet_type,
    encrypted_seed_phrase,
    encrypted_magic_seed_phrase_share,
    encrypted_client_seed_phrase_share,
    encrypted_client_seed_phrase_share_metadata: client_share_metadata,
    hd_path,
  };

  return HttpService.magic.post<SyncWalletBody>(endpoint, body, getHeaders());
}
