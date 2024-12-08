import { HttpService } from '~/app/services/http';
import { DelegatedWalletInfo } from '~/app/types/delegated-wallet-types';
import { getLogger } from '~/app/libs/datadog';
import { buildMessageContext } from '~/app/libs/analytics-datadog-helpers';
import { SplitkeyWalletInfo } from '~/app/services/authentication/get-user-info';

interface SelectWalletResponse extends SplitkeyWalletInfo {
  delegated_wallet_info: DelegatedWalletInfo;
  wallet_id: string;
  wallet_scope: 'magic' | 'connect';
  public_address: string;
  encrypted_private_address: string;
  encrypted_seed_phrase: string;
  hd_path: string;
}

export const selectWallet = async (
  authUserId,
  walletId,
  walletScope: 'magic' | 'connect',
): Promise<SelectWalletResponse | undefined> => {
  const endpoint = `v1/connect/user/wallet/select`;
  const body = {
    auth_user_id: authUserId,
    wallet_id: walletId,
    wallet_scope: walletScope,
  };

  try {
    const { data } = await HttpService.magic.post<any>(endpoint, body);
    return data;
  } catch (e) {
    getLogger().error('Error with selectWallet', buildMessageContext(e));
    return undefined;
  }
};
