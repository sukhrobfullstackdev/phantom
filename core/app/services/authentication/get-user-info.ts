import { HttpService } from '../http';
import { DelegatedWalletInfo } from '../../types/delegated-wallet-types';
import { WalletType, LoginMethodType } from '../../constants/flags';
import { MagicAPIResponse } from '~/shared/types/magic-api-response';
import { getHeaders, isGlobalAppScope } from '~/app/libs/connect-utils';
import { RecoveryMethodType } from '~/features/recovery/constants/flags';
import { globalCache } from '~/shared/libs/cache';
import { USER_CACHE_CLEAR_REGEX } from './get-user';

interface WebAuthnDevicesInfoType {
  id: string;
  nickname: string;
  transport: string;
  user_agent: string;
}

interface WebAuthnInfoType {
  devices_info: Array<WebAuthnDevicesInfoType>;
  username: string;
}

export interface UserConsentTypes {
  email: true;
}

export type SplitkeyWalletInfo = {
  encrypted_magic_private_address_share?: string | null;
  encrypted_client_private_address_share?: string | null;
  encrypted_client_private_address_share_metadata?: object | null;
  encrypted_magic_seed_phrase_share?: string | null;
  encrypted_client_seed_phrase_share?: string | null;
  encrypted_client_seed_phrase_share_metadata?: object | null;
};

export interface UserInfo extends SplitkeyWalletInfo {
  auth_user_id: string;
  auth_user_mfa_active: boolean;
  auth_user_wallet_id: string;
  encrypted_private_address: string | null;
  encrypted_seed_phrase: string | null;
  public_address: string;
  delegated_wallet_info: DelegatedWalletInfo;
  utc_timestamp_ms: number;
  client_id: string; // Magic application entity ID
  consent: UserConsentTypes;
  used_chain_ids?: string[] | undefined[];
  login: {
    type: LoginMethodType;
    oauth2: string | null;
    webauthn: string | null | WebAuthnInfoType;
  };
  recoveryFactors: [RecoveryFactor];
}
type GetUserInfoResponse = MagicAPIResponse<UserInfo>;

export interface UserInfoStorageCache {
  data: UserInfo;
  walletType: WalletType;
}

type RecoveryFactor = {
  type: RecoveryMethodType;
  value: string;
};

export const USER_INFO_CACHE_CLEAR_REGEX = /\/user\/info\/retrieve/g;
const useInfoCacheDurationSeconds = 8;

const fetchUserInfo = (endpoint: string) => {
  return HttpService.magic.get<GetUserInfoResponse>(endpoint, getHeaders());
};

/**
 * @deprecated The function will be removed soon after retrieve optimizations
 */

/**
 * TODO: For the mandrake migration, spend some time with @BrianClearly
 * to understand how to systematically move the cache to indexedDB.
 */
export async function getUserInfo(userID: string, wallet_type: string = WalletType.ETH) {
  const base = isGlobalAppScope() ? 'v1/connect' : 'v3/auth';
  const endpoint = `${base}/user/info/retrieve?auth_user_id=${userID}&wallet_type=${wallet_type}`;

  // if not MC (Product type) and therefore not global app scope, cache user-info calls
  if (!isGlobalAppScope()) {
    const result = await globalCache.get<GetUserInfoResponse>(
      endpoint,
      () => fetchUserInfo(endpoint),
      useInfoCacheDurationSeconds * 1000,
    );
    if (result.data.delegated_wallet_info.should_create_delegated_wallet) {
      // clear cache if there is no wallet.
      globalCache.clear(endpoint);

      // this is here until this '/user/info/retrieve' endpoint is depricated
      globalCache.clearByRegex(USER_CACHE_CLEAR_REGEX);
    }
    return result;
  }

  return fetchUserInfo(endpoint);
}
