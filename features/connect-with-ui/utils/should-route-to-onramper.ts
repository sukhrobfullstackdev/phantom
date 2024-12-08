import { isETHWalletType } from '~/app/libs/network';
import { getUserLocation } from './get-user-location';
import { isOptimism } from './is-optimism';
import { store } from '~/app/store';
import { setUserLocation } from '~/app/store/user/user.actions';
import { IS_DEPLOY_ENV_DEV, IS_DEPLOY_ENV_STAGEF, IS_NODE_ENV_DEV } from '~/shared/constants/env';
import { getLogger } from '~/app/libs/datadog';
import { buildMessageContext } from '~/app/libs/analytics-datadog-helpers';

// Redirect to On Ramper for Flow, Optimism, and users located outside of USA
export const shouldRouteToOnRamper = async (
  isMainnet: boolean,
  network: string | undefined,
  isFiatOnRampEnabled: boolean,
  isFiatOnRampSardineEnabled: boolean,
  isFiatOnRampStripeEnabled: boolean,
) => {
  const isProd = !(IS_NODE_ENV_DEV || IS_DEPLOY_ENV_DEV || IS_DEPLOY_ENV_STAGEF);
  // Route to on-ramp selection page if testnet && prod
  if (!isMainnet && isProd) {
    return false;
  }
  if (
    !isETHWalletType() ||
    isOptimism(network) ||
    (!isFiatOnRampEnabled && !isFiatOnRampSardineEnabled && !isFiatOnRampStripeEnabled)
  ) {
    return true;
  }
  let isUSA = true;
  try {
    const userLocation = await getUserLocation();
    store.dispatch(setUserLocation(userLocation.data));
    isUSA = userLocation?.data?.is_usa;
  } catch (e) {
    getLogger().error('Error with getUserLocation', buildMessageContext(e));
  }
  const routeToOnRamper = !isUSA;
  return routeToOnRamper;
};
