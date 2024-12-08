import { isGlobalAppScope } from '~/app/libs/connect-utils';
import { connectStore } from '../store';

export const getLoginMethod = () => {
  if (!isGlobalAppScope()) return;
  const { activeThirdPartyWallet, lastSelectedLogin } = connectStore.getState();
  return {
    mc: { loginMethod: activeThirdPartyWallet || lastSelectedLogin },
  };
};

export const eventData = getLoginMethod();
