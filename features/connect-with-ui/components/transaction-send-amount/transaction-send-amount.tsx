import React from 'react';
import { Skeleton, Spacer, Typography } from '@magiclabs/ui';
import { CurrencyFormatter } from '../currency-formatter';
import { TokenTransferDetailsType } from '../transaction-line-item';
import { TokenFormatter } from '../token-formatter';

interface TransactionSendAmountProps {
  fiatValue: undefined | string | number;
  tokenTransferDetails: TokenTransferDetailsType | undefined;
}

export const TransactionSendAmount = ({ fiatValue, tokenTransferDetails }: TransactionSendAmountProps) => {
  const waitingForInputData = fiatValue === undefined && !tokenTransferDetails;
  return (
    <div style={{ textAlign: 'center' }}>
      {waitingForInputData ? (
        <div>
          <Spacer size={2} orientation="vertical" />
          <Skeleton shape="pill" height="40px" width="110px" />
          <Spacer size={2} orientation="vertical" />
        </div>
      ) : (
        <Typography.H2>
          {!tokenTransferDetails && <CurrencyFormatter value={Number(fiatValue)} />}
          {tokenTransferDetails && (
            <TokenFormatter value={Number(tokenTransferDetails.amount)} token={tokenTransferDetails.symbol} />
          )}
        </Typography.H2>
      )}
    </div>
  );
};
