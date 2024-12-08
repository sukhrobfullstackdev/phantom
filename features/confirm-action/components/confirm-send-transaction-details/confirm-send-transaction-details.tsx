import React from 'react';

import { Flex, Spacer, Typography } from '@magiclabs/ui';
import { TransactionSendAmount } from '~/features/connect-with-ui/components/transaction-send-amount';
import { TransactionTokenIcon } from '~/features/connect-with-ui/components/transaction-token-icon';
import { ToFromAddresses } from '~/features/connect-with-ui/components/to-from-addresses';
import {
  ETH_TRANSFER,
  FLOW_USDC_TRANSFER,
  TOKEN_TRANSFER,
  TransactionType,
} from '~/features/connect-with-ui/utils/transaction-type-utils';
import { ActionStatus } from '../../constants/confirm-action';

export const YouCanSavelyGoBackToApp = ({ appName }) => {
  return (
    <Typography.BodySmall
      style={{
        fontWeight: 400,
        color: 'var(--ink100)',
        fontSize: '16px',
      }}
    >
      You can safely close this window and go back to {appName}.
    </Typography.BodySmall>
  );
};

export const ConfirmSendTransactionDetails: React.FC<{
  appName: string;
  transactionType: TransactionType;
  amount?: string;
  tokenAmount?: string;
  currency?: string;
  symbol?: string;
  fiatValue?: string;
  from?: string;
  to?: string;
  chainInfoUri?: string;
  actionStatus: ActionStatus;
}> = ({
  appName,
  transactionType,
  amount,
  currency,
  tokenAmount,
  symbol,
  fiatValue,
  from,
  to,
  chainInfoUri,
  actionStatus,
}) => {
  if (actionStatus === ActionStatus.APPROVED) {
    return (
      <Flex.Column horizontal="center" style={{ textAlign: 'center', fontSize: '20px', lineHeight: '32px' }}>
        <b>Your transaction is being sent!</b>
        <Spacer orientation="vertical" size={8} />
        <YouCanSavelyGoBackToApp appName={appName} />
      </Flex.Column>
    );
  }
  if (actionStatus === ActionStatus.REJECTED) {
    return (
      <Flex.Column horizontal="center" style={{ textAlign: 'center', fontSize: '20px', lineHeight: '32px' }}>
        <b>You rejected the transaction</b>
        <Spacer orientation="vertical" size={8} />
        <YouCanSavelyGoBackToApp appName={appName} />
      </Flex.Column>
    );
  }
  if (transactionType === ETH_TRANSFER)
    return (
      <Flex.Column horizontal="center" style={{ textAlign: 'center', fontSize: '20px', lineHeight: '32px' }}>
        <b>Confirm your {appName} transaction</b>
        <Spacer orientation="vertical" size={16} />
        <Flex.Column horizontal="center" style={{ textAlign: 'center', fontSize: '20px', lineHeight: '32px' }}>
          <TransactionSendAmount fiatValue={fiatValue} tokenTransferDetails={undefined} />
        </Flex.Column>
        <Flex.Row />

        <Flex.Row vertical="center">
          <TransactionTokenIcon logo={undefined} tokenOverride={currency} transactionType={transactionType} size={18} />
          <Typography.BodySmall weight="400" style={{ marginLeft: '2px', fontSize: '18px' }}>
            {amount} {currency}
          </Typography.BodySmall>
        </Flex.Row>
        <Spacer size={15} orientation="vertical" />
        <ToFromAddresses to={to} from={from} chainInfoUriOverride={chainInfoUri} />
      </Flex.Column>
    );
  if (transactionType === TOKEN_TRANSFER || transactionType === FLOW_USDC_TRANSFER)
    return (
      <Flex.Column horizontal="center" style={{ textAlign: 'center', fontSize: '20px', lineHeight: '32px' }}>
        <b>Confirm your {appName} transaction</b>
        <Spacer orientation="vertical" size={24} />
        <Flex.Row vertical="center">
          <TransactionTokenIcon logo={undefined} tokenOverride={currency} transactionType={transactionType} size={26} />
          <Typography.BodySmall weight="400" style={{ marginLeft: '4px', fontSize: '24px' }}>
            <b>
              {tokenAmount} {symbol}
            </b>
          </Typography.BodySmall>
        </Flex.Row>
        <Spacer size={15} orientation="vertical" />
        <ToFromAddresses to={to} from={from} chainInfoUriOverride={chainInfoUri} />
      </Flex.Column>
    );
  return (
    <Flex.Column horizontal="center" style={{ textAlign: 'center', fontSize: '20px', lineHeight: '32px' }}>
      <b>Confirm your {appName} transaction</b>
      <Spacer size={15} orientation="vertical" />
      <ToFromAddresses to={to} from={from} chainInfoUriOverride={chainInfoUri} />
    </Flex.Column>
  );
};
