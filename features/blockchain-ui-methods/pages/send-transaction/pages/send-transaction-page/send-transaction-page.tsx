import React from 'react';
import { EthSendTransactionPage } from '../eth-send-transaction-page/eth-send-transaction-page';
import { useChainInfo } from '~/features/blockchain-ui-methods/hooks/use-chain-info';
import { StabilitySendTransactionPage } from '../stability-send-transaction-page/stability-send-transaction-page';

export const SendTransactionPage = () => {
  const { chainInfo } = useChainInfo();

  if (chainInfo.name === 'Stability') {
    return <StabilitySendTransactionPage />;
  }

  return <EthSendTransactionPage />;
};
