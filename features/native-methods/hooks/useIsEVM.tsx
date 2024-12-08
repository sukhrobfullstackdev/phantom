import { includes } from '~/app/libs/lodash-utils';
import { useMemo } from 'react';
import { useHistory } from 'react-router-dom';

import { getOptionsFromEndpoint } from '~/app/libs/query-params';
import { Endpoint } from '~/server/routes/endpoint';
import { networksByChainId } from '~/features/connect-with-ui/hooks/chainInfoContext';

export const useIsEVM = () => {
  const {
    location: { pathname },
  } = useHistory();

  const isEVM = useMemo(() => {
    if (pathname === Endpoint.Client.SendV1 || pathname === Endpoint.Client.SendLegacy) {
      const { ETH_NETWORK } = getOptionsFromEndpoint(Endpoint.Client.SendLegacy);
      return !!ETH_NETWORK;
    }

    if (pathname === Endpoint.Client.ConfirmNFTTransferV1) {
      const { ETH_NETWORK } = getOptionsFromEndpoint(Endpoint.Client.ConfirmNFTTransferV1);
      if (!ETH_NETWORK) {
        return false;
      }

      if (typeof ETH_NETWORK === 'string') {
        return true;
      }

      const { chainId } = ETH_NETWORK;
      return includes(Object.keys(networksByChainId), chainId);
    }

    return false;
  }, [pathname]);

  return { isEVM };
};
