import { HttpService } from '../http';
import { WalletType, LoginMethodType } from '../../constants/flags';
import { MagicAPIResponse } from '~/shared/types/magic-api-response';
import { getHeaders, isGlobalAppScope } from '~/app/libs/connect-utils';
import { globalCache } from '~/shared/libs/cache';
import { RecoveryMethodType } from '~/features/recovery/constants/flags';
import { RELAYER_USER_CACHE } from '~/shared/constants/storage';
import { getStorageCache } from '../web-storage/temp-cache';

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

export interface User {
  auth_user_id: string;
  auth_user_mfa_active?: boolean;
  utc_timestamp_ms: number;
  client_id: string; // Magic application entity ID
  public_address?: string;
  challenge_message?: string;
  login: {
    type: LoginMethodType;
    oauth2: string | null;
    webauthn: string | null | WebAuthnInfoType;
  };
  recovery_factors?: [RecoveryFactor];
  email?: string;
}

type GetUserResponse = MagicAPIResponse<User>;

export interface UserStorageCache {
  data: User;
  walletType: WalletType;
}

type RecoveryFactor = {
  type: RecoveryMethodType;
  value: string;
};

export const USER_CACHE_CLEAR_REGEX = /\/core\/user/g;
const useInfoCacheDurationSeconds = 8;

const fetchUser = (endpoint: string): Promise<GetUserResponse> => {
  return HttpService.magic.get<GetUserResponse>(endpoint, getHeaders());
};

export async function getUser(
  userID: string,
  wallet_type: string = WalletType.ETH,
  allowStorageCache = false,
): Promise<GetUserResponse> {
  const endpoint = `/v1/core/user?auth_user_id=${userID}&wallet_type=${wallet_type}`;

  // if allowed, look for user in storage cache first
  let cachedUser: UserStorageCache | null = null;

  if (allowStorageCache) {
    cachedUser = await getStorageCache(RELAYER_USER_CACHE);
  }

  if (cachedUser && cachedUser.walletType === wallet_type) {
    return { data: cachedUser.data, status: 'ok' } as GetUserResponse;
  }

  // if not MC (Product type) and therefore not global app scope, cache user-info calls
  if (!isGlobalAppScope()) {
    const result = await globalCache.get<GetUserResponse>(
      endpoint,
      () => fetchUser(endpoint),
      useInfoCacheDurationSeconds * 1000,
    );

    return result;
  }

  return fetchUser(endpoint);
}
