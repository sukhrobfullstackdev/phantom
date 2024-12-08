/* eslint-disable prefer-destructuring */

import { NETWORK_NAMES } from '~/app/constants/network-names';

export enum ENVType {
  Prod = 'prod',
  Dev = 'dev',
  Stagef = 'stagef',
  PreviewDeployments = 'preview-deployments',
  Local = 'local',
}

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const DEPLOY_ENV: ENVType = (process.env.DEPLOY_ENV as ENVType) || ENVType.Prod;
export const E2E_URL = 'https://relayer-test-kitchen.vercel.app/?env=phantomLocal';
export const BACKEND_URL = process.env.BACKEND_URL || 'https://api.fortmatic.com/';
export const NFT_API_URL = process.env.NFT_API_URL || 'https://nft-api.magic.link/';
export const GAS_API_URL = process.env.GAS_API_URL || 'https://gas-api.magic.link/';
export const DATADOG_API_URL = process.env.DATADOG_API_URL || 'https://api.datadoghq.com/api/v1';
export const HIGHTOUCH_API_KEY =
  process.env.HIGHTOUCH_API_KEY || '789cbfefe635d5b292958cd2261610fcd8f567664b5cd25cc186b46f05a8e6b0';
export const HIGHTOUCH_API_HOST = process.env.HIGHTOUCH_API_HOST || 'us-east-1.hightouch-events.com';

export const DATADOG_CLIENT_KEY = process.env.DATADOG_CLIENT_KEY!;
export const DATADOG_RUM_APP_KEY = process.env.DATADOG_RUM_APP_KEY || '9f6f3fdd-1d7c-4a3a-904a-67d27cc34265';
export const DATADOG_RUM_CLIENT_KEY = process.env.DATADOG_RUM_CLIENT_KEY || 'pub445edf06d6f2db976fc4393d9dc2898a';
export const DATADOG_API_KEY = process.env.DATADOG_API_KEY || '732fa83b0ce0f786a57301becbeb8e16';

export const IS_MAGIC = Boolean(Number(process.env.IS_MAGIC));
export const IS_STATIC_DEPLOYMENT = Boolean(Number(process.env.IS_STATIC_DEPLOYMENT));
export const IS_DEPLOY_ENV_PROD = DEPLOY_ENV === ENVType.Prod;
export const IS_DEPLOY_ENV_DEV = DEPLOY_ENV === ENVType.Dev;
export const IS_DEPLOY_ENV_STAGEF = DEPLOY_ENV === ENVType.Stagef;
export const IS_DEPLOY_ENV_LOCAL = DEPLOY_ENV === ENVType.Local;

export const MC_GOOGLE_OAUTH_CLIENT_ID =
  process.env.MC_GOOGLE_OAUTH_CLIENT_ID || '832269600623-itf89vjp9bcl84dtuahuhl9rhdg3kmjh.apps.googleusercontent.com';

export const MC_FIAT_ON_RAMP_ONRAMPER_API_KEY_WALLET_HUB =
  process.env.MC_FIAT_ON_RAMP_ONRAMPER_API_KEY_WALLET_HUB || 'pk_prod_01GTEYJ2ZB5SBRDH79FY843VHA';

export const MC_FIAT_ON_RAMP_ONRAMPER_API_KEY_DAPPS =
  process.env.MC_FIAT_ON_RAMP_ONRAMPER_API_KEY_DAPPS || 'pk_prod_01GXNN3PMY5GDYBTJYNY3VE63B';

export const LAUNCH_DARKLY_CLIENT_ID = process.env.LAUNCH_DARKLY_CLIENT_ID || '62962e438d3dd30c66e94c87';

export const IS_NODE_ENV_PROD = process.env.NODE_ENV === 'production';
export const IS_NODE_ENV_DEV = !IS_NODE_ENV_PROD;
export const IS_NODE_ENV_TEST = process.env.NODE_ENV === 'test';

export const GET_CREDENTIALS_PROXY_URL = process.env.GET_CREDENTIALS_PROXY_URL || 'https://gbscache.magic.link';

export const SARDINE_URL_TEST = process.env.SARDINE_URL_TEST || 'https://crypto.sandbox.sardine.ai';
export const SARDINE_URL_PROD = process.env.SARDINE_URL_PROD || 'https://crypto.sardine.ai';

export const MAGIC_WALLET_DAPP_API_KEY = process.env.MAGIC_WALLET_DAPP_API_KEY || 'pk_live_882646865C70D783';
export const MAGIC_WALLET_DAPP_REFERRER = process.env.MAGIC_WALLET_DAPP_REFERRER || 'https://wallet.magic.link';

export const CLUBHOUSE_PROD_API_KEYS = new Set<string>([
  'pk_live_D5E4C7B87987374A', // clubhouse_staging
  'pk_live_A2AAF58F86D8BCF1', // clubhouse_prod
]);

export const INTERNAL_CH_UI_TEST_KEYS = {
  dev: 'pk_live_6787CB25917B6E6B',
  local: 'pk_live_123C55EA4BE8F3BA',
  stagef: 'pk_live_3519E915C7F6AD43',
  prod: 'pk_live_9027BB99EA9B439B',
};

export const INTERNAL_CUSTOM_REDIRECT_UI_TEST_KEYS = {
  dev: 'pk_live_6787CB25917B6E6B',
  local: '',
  stagef: 'pk_live_3519E915C7F6AD43',
  prod: '',
};

export const CUSTOM_REDIRECT_PROD_API_KEYS = new Set<string>([
  'pk_live_EAE0CADF2404479C', // oddsjam
  'pk_live_822637E116B2CA8A', // btcmag
]);

export const ALCHEMY_KEYS = {
  [NETWORK_NAMES.ETHEREUM]: process.env.ALCHEMY_ETHEREUM_API_KEY || 'THLzcjj0X_ktVcj80LZ60_twjxdWuUso',
  [NETWORK_NAMES.GOERLI]: process.env.ALCHEMY_GOERLI_API_KEY || 'XDkXOl3fIkG3-XFvRmaa313PPJEehNx4',
  [NETWORK_NAMES.SEPOLIA]: process.env.ALCHEMY_SEPOLIA_API_KEY || 'lnkxjj_rKFZRHqrrIvoerSJtzIdt2ElK',
  [NETWORK_NAMES.POLYGON]: process.env.ALCHEMY_POLYGON_API_KEY || 'gQ41RwtnmeUVJtVLRSKGE8_V-dTWV7WD',
  [NETWORK_NAMES.POLYGON_MUMBAI]: process.env.ALCHEMY_MUMBAI_API_KEY || '9b1326CuGOhpxr_RhB2QoPXKpfbuJsDF',
  [NETWORK_NAMES.POLYGON_AMOY]: process.env.ALCHEMY_AMOY_API_KEY || '1D6XDLjXPWIj_rf4dPgdM9M_QgqTtPGa',
  [NETWORK_NAMES.OPTIMISM]: process.env.ALCHEMY_OPTIMISM_API_KEY || 'NyNr8gCoYyusotfANwHTuRhIQp62ZF3u',
  [NETWORK_NAMES.OPTIMISM_GOERLI]: process.env.ALCHEMY_OPTIMISM_GOERLI_API_KEY || 'ynnAby9IhcpGA9l3x3nqD5zuE4r2gWo4',
  [NETWORK_NAMES.ARBITRUM_ONE]: process.env.ALCHEMY_ARBITRUM_ONE_API_KEY || '0JEi2UcN80f4vOja1KopbdXWRKY4DXrD',
  [NETWORK_NAMES.ARBITRUM_SEPOLIA]: process.env.ALCHEMY_ARBITRUM_SEPOLIA_API_KEY || '6qaqXS9Hll37pWWWmhetS0v1pAkRKlFA',
  [NETWORK_NAMES.BASE]: process.env.ALCHEMY_BASE_API_KEY || 'tbH7VdREUS9E1caIfz0FMCO_DfdJSNZS',
  [NETWORK_NAMES.BASE_SEPOLIA]: process.env.ALCHEMY_BASE_SEPOLIA_API_KEY || 'xtBmbqs4Xe17IVlF65vU6BmTEKLBybir',
} as const;
