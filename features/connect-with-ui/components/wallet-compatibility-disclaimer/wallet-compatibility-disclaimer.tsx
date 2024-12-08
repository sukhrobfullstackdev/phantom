import React from 'react';
import { Typography } from '@magiclabs/ui';
import styles from './wallet-compatibility-disclaimer.less';
import { isETHWalletType } from '~/app/libs/network';
import { useChainInfo } from '~/features/blockchain-ui-methods/hooks/use-chain-info';

export const WalletCompatibilityDisclaimer = () => {
  const { chainInfo } = useChainInfo();

  const renderIndeterminateArticle = () => {
    const firstChar = chainInfo.networkName.toLowerCase()[0];

    return ['a', 'e', 'i', 'o', 'u'].includes(firstChar) ? 'an' : 'a';
  };

  return (
    <Typography.BodySmall className={styles.note} weight="400">
      This is {renderIndeterminateArticle()} <strong style={{ fontWeight: 'bold' }}>{chainInfo.networkName}</strong>{' '}
      wallet.{' '}
      {isETHWalletType()
        ? `Only send ${chainInfo.currency} or other ${chainInfo.tokenCompatibility} tokens to this wallet.`
        : `Only send ${chainInfo.currency}, ${chainInfo.tokenCompatibility}, or other ${chainInfo.currency} tokens to this address`}
    </Typography.BodySmall>
  );
};
