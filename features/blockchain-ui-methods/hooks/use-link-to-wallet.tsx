import { useCallback } from 'react';
import { useChainInfo } from '~/features/blockchain-ui-methods/hooks/use-chain-info';

export const useLinkToWallet = () => {
  const { chainInfo } = useChainInfo();

  const linkToWallet = useCallback(
    (address: string) => {
      window.open(`${chainInfo.blockExplorer}/address/${address}`, '_blank');
    },
    [chainInfo],
  );

  return { linkToWallet };
};
