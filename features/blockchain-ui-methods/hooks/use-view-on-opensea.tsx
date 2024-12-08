import { useCallback, useEffect, useState } from 'react';
import { OPENSEA_NETWORKS } from '~/app/constants/opensea-networks';
import { useChainInfo } from '~/features/blockchain-ui-methods/hooks/use-chain-info';
import { store } from '~/app/store';
import { CustomizedNFTMarketplaceURLFlagValue } from '~/app/libs/launchDarkly/launchDarklyTypes';

export const useViewOnOpenSea = () => {
  const { chainInfo } = useChainInfo();
  const [showViewButton, setShowViewButton] = useState<boolean>(false);
  const [isCustomizedEnabled, setIsCustomizedEnabled] = useState<boolean>(false);

  const { LAUNCH_DARKLY_FEATURE_FLAGS } = store.getState().System;
  const customizeUrlFlag = LAUNCH_DARKLY_FEATURE_FLAGS[
    'is-customize-nft-marketplace-url-enable'
  ] as CustomizedNFTMarketplaceURLFlagValue;

  useEffect(() => {
    // if the flag is disabled Display the Opensea View button
    // If the flag is enabled and the URL is not empty Display the View button with customized URL
    // If the flag is enabled, hide the button
    setShowViewButton(!customizeUrlFlag.enabled || !!customizeUrlFlag.url);
    setIsCustomizedEnabled(!!customizeUrlFlag.url);
  }, []);

  const viewOnOpenSea = useCallback(
    ({ contractAddress, tokenId }: { contractAddress: string; tokenId: string | number }) => {
      const url = customizeUrlFlag.enabled
        ? customizeUrlFlag.url
        : `https://${chainInfo.isMainnet ? '' : 'testnets.'}opensea.io/assets/${
            OPENSEA_NETWORKS[chainInfo.networkName]
          }/${contractAddress}/${tokenId}`;

      window.open(url, '_blank', 'noopener noreferrer');
    },
    [chainInfo, customizeUrlFlag],
  );

  return { viewOnOpenSea, showViewButton, isCustomizedEnabled };
};
