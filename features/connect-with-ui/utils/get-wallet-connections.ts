import { HttpService } from '~/app/services/http';
import { getWalletType } from '~/app/libs/network';
import { getLogger } from '~/app/libs/datadog';
import { buildMessageContext } from '~/app/libs/analytics-datadog-helpers';

export interface ConnectWalletType {
  public_address: string;
  wallet_id: string;
  time_created_ms: number;
  time_last_selected_ms: number | null;
}

export interface AuthWalletType {
  public_address: string;
  wallet_id: string;
  time_created_ms: number;
  time_last_selected_ms: number | null;
  is_mfa_enabled: boolean;
  login_method: string;
  client_details: {
    client_id: string;
    asset_uri: string;
    is_default_asset: boolean;
    app_name: string;
    theme_color: string;
    button_color: string;
  };
}

export interface WalletConnectionsInfo {
  isFirstExposure: boolean;
  connectWallets: ConnectWalletType[];
  authWallets: AuthWalletType[];
}

interface WalletConnectionsResponse {
  data: {
    first_multi_wallet_exposure: boolean;
    connect_wallets: ConnectWalletType[];
    auth_wallets: AuthWalletType[];
  };
  error_code: string;
  message: string;
  status: 'ok' | 'failed';
}

export const getWalletConnections = async (authUserId: string): Promise<WalletConnectionsInfo | undefined> => {
  const walletType = getWalletType();
  const endpoint = `
		v1/connect/user/wallet/connections?
		wallet_type=${walletType}&
		auth_user_id=${authUserId}`;
  try {
    const { data } = await HttpService.magic.get<WalletConnectionsResponse>(endpoint);
    return {
      isFirstExposure: data.first_multi_wallet_exposure,
      authWallets: data.auth_wallets,
      connectWallets: data.connect_wallets,
    };
  } catch (e) {
    getLogger().error(`Error with getWalletConnections`, buildMessageContext(e));
    return undefined;
  }
};
