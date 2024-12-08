import React, { useContext } from 'react';
import { Flex, Icon, Skeleton, Spacer, Typography } from '@magiclabs/ui';
import { NetworkFeeTooltip } from '../network-fee-tooltip';
import { TokenFormatter } from '../token-formatter';
import { CurrencyFormatter } from '../currency-formatter';
import styles from './transaction-line-item.less';
import { MultiChainInfoContext } from '~/features/connect-with-ui/hooks/multiChainContext';
import LedgerBalance from '~/app/libs/ledger-balance';
import { WarningIconSolid } from '~/shared/svg/magic-connect';
import { FreeBadge } from '~/features/blockchain-ui-methods/pages/send-gasless-transaction/components/free-badge/free-badge';

export type TokenTransferDetailsType = {
  to: string;
  amount: string;
  symbol: string;
};

export interface TransactionLineItemProps {
  label: 'Send Amount' | 'Network Fee' | 'Total';
  amount: string | undefined;
  fiat: number | undefined;
  tooltip: boolean;
  isLowBalance: boolean;
  tokenTransferDetails?: TokenTransferDetailsType | undefined;
}

export const TransactionLineItem = ({
  label,
  amount,
  fiat,
  tooltip,
  isLowBalance,
  tokenTransferDetails,
}: TransactionLineItemProps) => {
  const chainInfo = useContext(MultiChainInfoContext);
  const errorCalculatingNetworkFee = amount === '--';
  const waitingForInputData = (amount === undefined || fiat === undefined) && !tokenTransferDetails;
  const shouldDisplayFiatValue =
    amount !== undefined && fiat !== undefined && !tokenTransferDetails && !errorCalculatingNetworkFee;
  const ledgerBalance = new LedgerBalance();
  const showHighlightedText = isLowBalance && label === 'Total';

  return (
    <Flex.Row justifyContent="space-between">
      <Flex.Row>
        <Typography.BodySmall weight="400">{label}</Typography.BodySmall>
        <Spacer size={5} orientation="horizontal" />
        {tooltip && <NetworkFeeTooltip />}
      </Flex.Row>
      <Flex.Row>
        {waitingForInputData && <Skeleton shape="pill" height="24px" width="100px" />}
        {!errorCalculatingNetworkFee && tokenTransferDetails && (
          <Typography.BodySmall weight="400" className={styles.subText}>
            <TokenFormatter value={Number(tokenTransferDetails.amount)} token={tokenTransferDetails.symbol} />
          </Typography.BodySmall>
        )}
        {errorCalculatingNetworkFee && (
          <Typography.BodySmall weight="400">
            {amount} {chainInfo?.currency}
          </Typography.BodySmall>
        )}
        {shouldDisplayFiatValue &&
          (amount === '0' ? (
            <FreeBadge />
          ) : (
            <Flex.Row alignItems="center">
              <Typography.BodySmall
                weight="400"
                className={`${styles.subText} ${showHighlightedText ? styles.balanceAlert : ''}`}
              >
                <TokenFormatter value={ledgerBalance.displayAmount(amount || '0')} token={chainInfo?.currency} />
              </Typography.BodySmall>
              <Spacer size={8} orientation="horizontal" />
              <Typography.BodySmall className={`${showHighlightedText ? styles.balanceAlert : ''}`}>
                <CurrencyFormatter value={fiat || 0} />
              </Typography.BodySmall>
              {showHighlightedText ? (
                <>
                  <Spacer size={5} orientation="horizontal" />
                  <Icon type={WarningIconSolid} />
                </>
              ) : null}
            </Flex.Row>
          ))}
      </Flex.Row>
    </Flex.Row>
  );
};

TransactionLineItem.defaultProps = {
  tokenTransferDetails: undefined,
};
