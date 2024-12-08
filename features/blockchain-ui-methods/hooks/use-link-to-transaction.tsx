import { useCallback } from 'react';
import { useChainInfo } from '~/features/blockchain-ui-methods/hooks/use-chain-info';

export const useLinkToTransaction = () => {
  const { chainInfo } = useChainInfo();

  const linkToTransaction = useCallback(
    (hash: string) => {
      window.open(`${chainInfo.blockExplorer}/tx/${hash}`, '_blank', 'noopener noreferrer');
    },
    [chainInfo],
  );

  return { linkToTransaction };
};
