import React, { useContext } from 'react';
import { Flex, Icon, Spacer, Typography } from '@magiclabs/ui';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { CheckMarkIcon, ExternalLink, LoadingIcon } from '~/shared/svg/magic-connect';
import styles from './transaction-status.less';
import { MultiChainInfoContext } from '~/features/connect-with-ui/hooks/multiChainContext';
import LedgerBalance from '~/app/libs/ledger-balance';

interface TransactionStatusProps {
  message: 'Transfer Started' | 'Sending Funds' | 'Transfer Complete';
  hash?: string;
  isCompleted: boolean;
  isShowLink: boolean;
}

export const TransactionStatus = ({ message, hash, isCompleted, isShowLink }: TransactionStatusProps) => {
  const chainInfo = useContext(MultiChainInfoContext);
  const { theme } = useTheme();
  const ledgerBalance = new LedgerBalance();

  return (
    <Flex.Row alignItems="center">
      {isCompleted ? (
        <Flex.Row>
          <Icon type={CheckMarkIcon} size={25} color={theme.hex.primary.lightest} />
          <Spacer size={12} orientation="horizontal" />

          {/* eslint-disable-next-line no-nested-ternary */}
          {message === 'Transfer Started' ? (
            isShowLink ? (
              <a
                href={ledgerBalance.getExplorerTransactionUrl(chainInfo?.blockExplorer, hash)}
                rel="noreferrer"
                target="_blank"
                className={styles.etherscanLink}
              >
                <Typography.BodyMedium className={styles.transferProgress}>
                  Transfer Started <Icon type={ExternalLink} color={theme.hex.primary.base} />
                </Typography.BodyMedium>
              </a>
            ) : (
              <Typography.BodyMedium className={styles.transferProgress}>Transfer Started</Typography.BodyMedium>
            )
          ) : isShowLink ? (
            <a
              href={ledgerBalance.getExplorerTransactionUrl(chainInfo?.blockExplorer, hash)}
              rel="noreferrer"
              target="_blank"
              className={styles.etherscanLink}
            >
              <Typography.BodyMedium className={styles.transferProgress}>
                {`${message} `}
                <Icon type={ExternalLink} color={theme.hex.primary.base} />
              </Typography.BodyMedium>
            </a>
          ) : (
            <Typography.BodyMedium className={styles.transferProgress}>{message}</Typography.BodyMedium>
          )}
        </Flex.Row>
      ) : (
        <Flex.Row>
          <Icon type={LoadingIcon} size={25} className={styles.loadingSpinner} color={theme.hex.primary.lighter} />
          <Spacer size={12} orientation="horizontal" />
          <Typography.BodyMedium weight="400">{message}</Typography.BodyMedium>
        </Flex.Row>
      )}
    </Flex.Row>
  );
};

TransactionStatus.defaultProps = {
  hash: '',
};
