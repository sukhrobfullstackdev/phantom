import React from 'react';
import { Typography } from '@magiclabs/ui';
import { i18n } from '~/app/libs/i18n';
import { ExternalLinkIcon } from '~/features/native-methods/ui/icons/ExternalLinkIcon';
import { useNFTCryptoCheckoutState } from '../hooks/use-nft-crypto-checkout-state';
import { useChainInfo } from '~/features/blockchain-ui-methods/hooks/use-chain-info';
import styles from './view-transaction-link.less';

export const ViewTransactionLink = () => {
  const { chainInfo } = useChainInfo();
  const {
    nftCryptoCheckoutState: { txHash },
  } = useNFTCryptoCheckoutState();

  return (
    <a
      className={styles['view-transaction-button']}
      target="_blank"
      href={`${chainInfo.blockExplorer}/tx/${txHash}`}
      rel="noopener noreferrer"
    >
      <Typography.BodyMedium weight="600" color="var(--magic50)">
        {i18n.nft_checkout.view_transaction.toString()}
      </Typography.BodyMedium>
      <ExternalLinkIcon size={16} color="var(--magic50)" />
    </a>
  );
};
