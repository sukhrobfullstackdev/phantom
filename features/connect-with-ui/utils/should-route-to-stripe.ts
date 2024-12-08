import { isGlobalAppScope } from '~/app/libs/connect-utils';
import { getOptionsFromEndpoint } from '~/app/libs/query-params';
import { Endpoint } from '~/server/routes/endpoint';
import { IS_DEPLOY_ENV_DEV, IS_DEPLOY_ENV_STAGEF, IS_NODE_ENV_DEV } from '~/shared/constants/env';

// Redirect to Stripe if MA wallet
export const shouldRouteToStripe = (isMainnet: boolean) => {
  const options = getOptionsFromEndpoint(Endpoint.Client.SendLegacy);
  const isProd = !(IS_NODE_ENV_DEV || IS_DEPLOY_ENV_DEV || IS_DEPLOY_ENV_STAGEF);
  // Don't redirect if user is on testnet as on-ramps are disabled in prod
  if (!isMainnet && isProd) return false;
  // if a customer has KYB'd with OnRamper and they pass us their OnRamper API key, we should not redirect them to Stripe
  if ((options?.meta as Record<string, string>)?.onRamperApiKey) return false;
  return !isGlobalAppScope();
};
