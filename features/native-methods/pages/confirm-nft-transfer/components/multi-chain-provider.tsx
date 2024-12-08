import React, { PropsWithChildren, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { includes } from '~/app/libs/lodash-utils';
import { getOptionsFromEndpoint } from '~/app/libs/query-params';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { LedgerNetworks, MultiChainInfoContext } from '~/features/connect-with-ui/hooks/multiChainContext';
import { PendingSpinner } from '~/features/native-methods/ui/PendingSpinner';
import { Endpoint } from '~/server/routes/endpoint';

export const MultiChainProvider = ({ children }: PropsWithChildren) => {
  const {
    location: { pathname },
  } = useHistory();
  const { navigateTo } = useControllerContext();
  const [chainInfo, setChainInfo] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (includes([Endpoint.Client.ConfirmNFTTransferV1, Endpoint.Client.ConfirmAction], pathname)) {
      const { ETH_NETWORK } = getOptionsFromEndpoint(Endpoint.Client.ConfirmNFTTransferV1);
      if (!ETH_NETWORK) {
        navigateTo('nft-transfer-invalid-params');
        setMounted(true);
        return;
      }

      let chainId: string | null = null;

      if (typeof ETH_NETWORK === 'string') {
        switch (ETH_NETWORK) {
          case 'mainnet':
            chainId = '1';
            break;
          case 'goerli':
            chainId = '5';
            break;
          case 'sepolia':
            chainId = '11155111';
            break;
          default:
            break;
        }
      } else {
        chainId = ETH_NETWORK.chainId;
      }

      const chainData = LedgerNetworks.ETH;
      if (!chainId || !includes(Object.keys(chainData), chainId)) {
        navigateTo('nft-transfer-invalid-params');
        setMounted(true);
        return;
      }

      const data = chainData[chainId];
      setChainInfo(data);
    } else {
      navigateTo('nft-transfer-not-supported');
      return;
    }

    setMounted(true);
  }, []);

  return (
    <MultiChainInfoContext.Provider value={chainInfo}>
      {mounted ? children : <PendingSpinner />}
    </MultiChainInfoContext.Provider>
  );
};
