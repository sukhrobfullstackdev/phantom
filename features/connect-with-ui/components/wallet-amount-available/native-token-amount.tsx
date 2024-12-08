import { Icon, Skeleton, Spacer, Typography } from '@magiclabs/ui';
import React, { useContext } from 'react';
import LedgerBalance from '~/app/libs/ledger-balance';
import { useGetNativeTokenBalance } from '~/features/connect-with-ui/hooks/useGetNativeTokenBalance';
import { useGetTokenPrice } from '~/features/connect-with-ui/hooks/useGetTokenPrice';
import { CurrencyFormatter } from '../currency-formatter';
import { IMultiChainInfo, MultiChainInfoContext } from '~/features/connect-with-ui/hooks/multiChainContext';
import { TokenFormatter } from '../token-formatter';
import styles from './wallet-amount-available.less';

export const NativeTokenAmountAvailable = ({ isInputFormatFiat }) => {
  const balance: string | undefined = useGetNativeTokenBalance();
  const price: string | undefined = useGetTokenPrice();
  const chainInfo = useContext(MultiChainInfoContext);
  const { tokenIcon } = chainInfo as IMultiChainInfo;
  const ledgerBalance = new LedgerBalance();

  return (
    <div className={styles.toolTip}>
      <div className={styles.amount}>
        {chainInfo && <Icon color="7343DC" size={24} type={tokenIcon} />}
        <Spacer size={8} orientation="horizontal" />
        <Typography.BodySmall weight="500">
          {/* eslint-disable-next-line no-nested-ternary */}
          {balance !== undefined && price ? (
            isInputFormatFiat ? (
              <CurrencyFormatter value={ledgerBalance.calculateRate()(balance, price)} />
            ) : (
              // Only show available balance after network fee
              <TokenFormatter value={ledgerBalance.balanceToShow(balance)} token={chainInfo?.currency} />
            )
          ) : (
            <Skeleton shape="pill" height="20px" width="50px" />
          )}
        </Typography.BodySmall>
        <Typography.BodySmall className={styles.sendAmountAvailable} weight="400">
          available
        </Typography.BodySmall>
      </div>
    </div>
  );
};
