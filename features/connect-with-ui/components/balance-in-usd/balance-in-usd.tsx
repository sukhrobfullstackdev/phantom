import React from 'react';
import { Skeleton, Typography } from '@magiclabs/ui';
import { CurrencyFormatter } from '../currency-formatter';
import { useGetTokenPrice } from '../../hooks/useGetTokenPrice';
import { useGetNativeTokenBalance } from '../../hooks/useGetNativeTokenBalance';
import LedgerBalance from '~/app/libs/ledger-balance';

export const BalanceInUsd = () => {
  const balance: string | undefined = useGetNativeTokenBalance();
  const price: string | undefined = useGetTokenPrice();
  const ledgerBalance = new LedgerBalance();
  const value = ledgerBalance.calculateRate()(balance, price);

  return (
    <Typography.H2 color="inherit">
      {balance !== undefined && price ? (
        <CurrencyFormatter value={value} />
      ) : (
        <Skeleton shape="pill" height="40px" width="100px" />
      )}
    </Typography.H2>
  );
};
