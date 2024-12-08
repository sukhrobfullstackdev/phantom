import { RawThemeConfig, ThemeType } from '../theme';
import { getDecodedOptionsFromQueryParams, getParsedQueryParams } from './parsers';
import { parseJWT } from '~/app/libs/base64';
import { getApiKey } from '../api-key';
import { Endpoint } from '~/server/routes/endpoint';
import { ExtensionOptions } from '../../types/extension-options';
import { CustomBrandingType } from '~/shared/types/theme';
import { DeviceMetadata } from '~/features/device-verification/components/device-confirm-states';

// --- Shared --------------------------------------------------------------- //

type E = 'testnet' | 'mainnet';

/**
 * Parse an environment type ('testnet' or 'mainnet') from the current query
 * parameters.
 */
export function getEnvironmentTypeFromQueryParams(): E {
  const { e } = getParsedQueryParams<{ e: E }>();
  const apiKey = getApiKey();

  if (apiKey) return apiKey.startsWith('pk_live') ? 'mainnet' : 'testnet';
  if (['mainnet', 'testnet'].includes(e!)) return e!;

  return 'testnet';
}

// --- Query parsers per endpoint ------------------------------------------- //
export interface Options {
  [Endpoint.Client.SendV1]: {
    API_KEY?: string;
    DOMAIN_ORIGIN?: string;
    ETH_NETWORK?: string | { rpcUrl: string; chainId?: number; chainType?: string };
    host?: string;
    sdk?: string;
    version?: string;
    ext?: Partial<ExtensionOptions>;
    locale?: string;
    bundleId?: string;
    meta?: unknown;
  };

  [Endpoint.Client.SendLegacy]: {
    API_KEY?: string;
    DOMAIN_ORIGIN?: string;
    ETH_NETWORK?: string | { rpcUrl: string; chainId?: number; chainType?: string };
    host?: string;
    sdk?: string;
    version?: string;
    ext?: Partial<ExtensionOptions>;
    locale?: string;
    bundleId?: string;
    meta?: unknown;
  };

  [Endpoint.Client.PreviewV1]: {
    color?: string;
    logoImage?: string;
    appName?: string;
    themeType?: ThemeType;
    locale?: string;
    customBrandingType?: CustomBrandingType;
  };

  [Endpoint.Client.ConfirmV1]: {
    tlt?: string;
    e?: E;
    ct?: RawThemeConfig;
    uid?: string;
    locale?: string;
    location?: string;
    redirect_url?: string;
    ak?: string;
    flow_context?: string;
    next_factor?: string;
    security_otp_challenge?: string;
  };

  [Endpoint.Client.LoginV1]: {
    tlt?: string;
    e?: E;
    ct?: RawThemeConfig;
    uid?: string;
    locale?: string;
    location?: string;
    redirect_url?: string;
    ak?: string;
  };

  [Endpoint.Client.ConfirmEmailV1]: {
    token?: string;
    e?: E;
    current_email?: string;
    ct?: RawThemeConfig;
    locale?: string;
  };

  [Endpoint.Client.ErrorV1]: {
    error_code?: string;
    message?: string;
    locale?: string;
    error_description?: string;
  };

  [Endpoint.Client.NewDeviceV1]: {
    exp: number;
    sub: string;
    ct?: RawThemeConfig;
    ak?: string;
    deviceToken: string;
    metadata: DeviceMetadata;
  };

  [Endpoint.Client.ConfirmNFTTransferV1]: {
    tct: string;
    ak?: string;
    ETH_NETWORK: { rpcUrl: string; chainId: string; chainType: string } | string;
  };
}

/**
 * Parse query parameters for a specific `endpoint`.
 */
export function getOptionsFromEndpoint<T extends keyof Options>(endpoint: T): Partial<Options[T]> {
  switch (endpoint) {
    case Endpoint.Client.SendV1:
    case Endpoint.Client.SendLegacy:
    case Endpoint.Client.PreviewV1:
      return getDecodedOptionsFromQueryParams() as Options[T];

    case Endpoint.Client.ConfirmEmailV1:
    case Endpoint.Client.ConfirmV1:
    case Endpoint.Client.LoginV1:
    case Endpoint.Client.ConfirmNFTTransferV1:
      return { ...getParsedQueryParams(), ct: getDecodedOptionsFromQueryParams('ct') } as Options[T];

    case Endpoint.Client.NewDeviceV1: {
      const deviceToken = getParsedQueryParams().token;
      const {
        aud,
        azp,
        exp, // expiry timestamp
        iat, // issued timestamp
        iss,
        jti,
        metadata,
        scope,
        style, // raw custom theme configs
        sub, // device profile id
      } = parseJWT(deviceToken).payload;
      return {
        exp,
        metadata,
        sub,
        deviceToken,
        ct: style,
        ak: getParsedQueryParams().ak, // api key
      } as Options[T];
    }
    case Endpoint.Client.ErrorV1:
    default:
      return getParsedQueryParams() as Options[T];
  }
}
