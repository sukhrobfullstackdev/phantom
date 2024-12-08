import { ClientConfigInfo } from '~/shared/types/client-config-response';
import { MagicAPIResponse } from '~/shared/types/magic-api-response';
import { HttpService } from '../http';
import { RELAYER_CONFIG_CACHE } from '~/shared/constants/storage';
import { getStorageCache } from '../web-storage/temp-cache';

type GetClientConfigResponse = MagicAPIResponse<ClientConfigInfo>;

/**
 * Retrieves the client config information (client_theme, configured_auth_providers, premium_features, product_type, flags) associated with the current API key.
 * This is intended to be called from the iframed context built via the SDK.
 */
export async function getClientConfig(version = 'v1', allowCache = false) {
  if (allowCache) {
    const cachedConfig = (await getStorageCache(RELAYER_CONFIG_CACHE)) as ClientConfigInfo;

    if (cachedConfig) return { data: cachedConfig, status: 'ok' } as GetClientConfigResponse;
  }

  const endpoint = `${version}/core/magic_client/config`;
  return HttpService.magic.get<GetClientConfigResponse>(endpoint);
}
