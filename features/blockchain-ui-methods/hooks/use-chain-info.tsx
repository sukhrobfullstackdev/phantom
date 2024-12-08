import { useContext } from 'react';
import { MultiChainInfoContext } from '~/features/connect-with-ui/hooks/multiChainContext';

export const useChainInfo = () => {
  const chainInfo = useContext(MultiChainInfoContext);

  if (!chainInfo) {
    throw new Error('useChainInfo must be used within a MultiChainInfoContext.Provider');
  }

  return { chainInfo };
};
