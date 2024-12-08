import { useMemo } from 'react';
import { useChainInfo } from './use-chain-info';
import { ALCHEMY_NETWORKS } from '~/app/constants/alchemy-networks';
import { has } from '~/app/libs/lodash-utils';
import { getLogger } from '~/app/libs/datadog';
import { Alchemy } from 'alchemy-sdk';
import { ALCHEMY_KEYS } from '~/shared/constants/env';

export const useAlchemy = () => {
  const { chainInfo } = useChainInfo();

  const alchemy = useMemo(() => {
    const { networkName } = chainInfo;

    if (!has(ALCHEMY_KEYS, chainInfo.networkName) || !has(ALCHEMY_NETWORKS, networkName)) {
      getLogger().error(`Warning with createAlchemy: Alchemy does not support [${networkName}]`);
      throw new Error('Alchemy does not support this network');
    }

    return new Alchemy({
      apiKey: ALCHEMY_KEYS[networkName],
      network: ALCHEMY_NETWORKS[networkName],
    });
  }, [chainInfo]);

  return { alchemy };
};
