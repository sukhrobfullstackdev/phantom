import { useMemo, useContext } from 'react';
import { Alchemy } from 'alchemy-sdk';

import { ALCHEMY_KEYS } from '~/shared/constants/env';
import { IChainInfo } from '~/features/connect-with-ui/hooks/chainInfoContext';
import { IMultiChainInfo } from '~/features/connect-with-ui/hooks/multiChainContext';
import { ALCHEMY_NETWORKS } from '~/app/constants/alchemy-networks';

export function useAlchemyInstance(context: React.Context<IChainInfo | IMultiChainInfo | null>) {
  const chainInfo = useContext(context);
  const networkName = chainInfo?.networkName;

  if (!networkName) return undefined;

  const alchemyInstance = useMemo(() => {
    return new Alchemy({
      apiKey: ALCHEMY_KEYS[networkName],
      network: ALCHEMY_NETWORKS[networkName],
    });
  }, []);

  return alchemyInstance;
}
