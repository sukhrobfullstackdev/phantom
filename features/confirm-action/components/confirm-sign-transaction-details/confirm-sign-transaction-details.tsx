import React from 'react';
import { MultiChainSignTransactionSignatureInfo } from '~/features/blockchain-ui-methods/pages/multi-chain-sign-transaction-page';
import { YouCanSavelyGoBackToApp } from '../confirm-send-transaction-details';
import { Flex, Spacer } from '@magiclabs/ui';

export const ConfirmSignTransactionDetails = ({ messageToShow, appName, requestDomain, actionStatus }) => {
  if (actionStatus === 'APPROVED') {
    return (
      <>
        <Flex.Column horizontal="center" style={{ textAlign: 'center', fontSize: '20px', lineHeight: '32px' }}>
          <b>Your transaction was successfully signed!</b>
          <Spacer orientation="vertical" size={8} />
          <YouCanSavelyGoBackToApp appName={appName} />
        </Flex.Column>
      </>
    );
  }
  if (actionStatus === 'REJECTED') {
    return (
      <>
        <Flex.Column horizontal="center" style={{ textAlign: 'center', fontSize: '20px', lineHeight: '32px' }}>
          <b>You rejected the transaction signature</b>
          <Spacer orientation="vertical" size={8} />
          <YouCanSavelyGoBackToApp appName={appName} />
        </Flex.Column>
      </>
    );
  }
  return (
    <Flex.Column
      horizontal="center"
      style={{ textAlign: 'center', fontSize: '20px', lineHeight: '32px', maxWidth: '100%' }}
    >
      <b>Confirm your {appName} transaction</b>
      <Spacer orientation="vertical" size={16} />
      <MultiChainSignTransactionSignatureInfo
        messageToShow={messageToShow}
        appName={appName}
        requestDomain={requestDomain}
      />
    </Flex.Column>
  );
};
