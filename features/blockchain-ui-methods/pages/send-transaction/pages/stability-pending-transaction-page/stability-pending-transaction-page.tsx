import React, { Suspense } from 'react';
import { BigNumber as BN } from 'bignumber.js';
import { Flex, Icon, Spacer, Typography } from '@magiclabs/ui';
import { SendTransactionLayout } from '../../components/send-transaction-layout';
import { useChainInfo } from '~/features/blockchain-ui-methods/hooks/use-chain-info';
import { useNetworkFee } from '~/features/blockchain-ui-methods/hooks/use-network-fee';
import { parseInReadablePrice } from '~/features/native-methods/utils/parse-to-readable-price';
import { useSendTransactionParams } from '../../hooks/use-send-transaction-params';
import { useTokenPrice } from '~/features/blockchain-ui-methods/hooks/use-token-price';
import { usePrimaryColor } from '~/features/native-methods/hooks/usePrimaryColor';
import { FromAddressToAddress } from '../../components/from-address-to-address';
import { SuccessIcon } from '~/features/native-methods/ui/icons/SuccessIcon';
import { ExternalLinkIcon } from '~/features/native-methods/ui/icons/ExternalLinkIcon';
import { Button } from '~/features/native-methods/ui/button/button';
import { useTransactionHash } from '../../hooks/use-transaction-hash';
import Color from 'color';
import { SpinnerIcon } from '~/features/native-methods/ui/icons/SpinnerIcon';
import { ErrorIcon } from '~/features/native-methods/ui/icons/ErrorIcon';
import { useThemeMode } from '~/features/native-methods/hooks/useThemeMode';
import { useLinkToTransaction } from '~/features/blockchain-ui-methods/hooks/use-link-to-transaction';
import {
  TRANSACTION_STATUS,
  useTransactionStatus,
} from '~/features/blockchain-ui-methods/hooks/use-transaction-status';
import { useCloseSendTransaction } from '../../hooks/use-close-send-transaction';
import { useLinkToWallet } from '~/features/blockchain-ui-methods/hooks/use-link-to-wallet';
import { SendTransactionErrorPage } from '../send-transaction-error-page/send-transaction-error-page';
import { PendingSpinner } from '~/features/native-methods/ui/PendingSpinner';
import { Animate } from '~/features/native-methods/components/animate/animate';
import { ErrorBoundary } from '~/app/libs/exceptions/error-boundary';

export const StabilityPendingTransactionPage = () => {
  return (
    <SendTransactionLayout>
      <ErrorBoundary fallback={<SendTransactionErrorPage />}>
        <Suspense fallback={<PendingSpinner />}>
          <Animate exitBeforeEnter>
            <Resolved />
          </Animate>
        </Suspense>
      </ErrorBoundary>
    </SendTransactionLayout>
  );
};

const Resolved = () => {
  const { mode } = useThemeMode();
  const { chainInfo } = useChainInfo();
  const { sendTransactionParams } = useSendTransactionParams();
  const { primaryColor } = usePrimaryColor();

  const { linkToTransaction } = useLinkToTransaction();
  const { linkToWallet } = useLinkToWallet();
  const { closeSendTransaction } = useCloseSendTransaction();

  const { tokenPrice } = useTokenPrice();
  const { networkFee } = useNetworkFee();

  const { transactionHash } = useTransactionHash();
  const { status } = useTransactionStatus({ hash: transactionHash });

  return (
    <Flex.Column alignItems="center">
      <Icon size={48} type={chainInfo.tokenIcon} />

      <Spacer size={16} orientation="vertical" />

      {new BN(networkFee).gt(0) ? (
        <Typography.H2>
          {parseInReadablePrice({
            amount: sendTransactionParams.value.toString(),
            price: tokenPrice,
          })}
        </Typography.H2>
      ) : (
        <Typography.H2 color={primaryColor}>Free Transaction!</Typography.H2>
      )}
      <Spacer size={8} orientation="vertical" />

      <FromAddressToAddress
        from={sendTransactionParams.from.toString()}
        to={sendTransactionParams.to?.toString()}
        linkToWallet={linkToWallet}
      />

      <Spacer size={40} orientation="vertical" />

      <Flex.Column
        style={{
          gap: '16px',
        }}
      >
        <Flex.Row
          alignItems="center"
          style={{
            gap: '16px',
          }}
        >
          <SuccessIcon
            size={20}
            color={primaryColor}
            style={{ backgroundColor: 'var(--white)', overflow: 'hidden', borderRadius: '100%' }}
          />
          <Flex.Row alignItems="center" style={{ gap: '4px' }}>
            <Typography.BodyMedium weight="700" color={primaryColor}>
              {' '}
              Transaction Submitted
            </Typography.BodyMedium>
            {transactionHash && (
              <ExternalLinkIcon
                size={16}
                color={primaryColor}
                style={{
                  cursor: 'pointer',
                }}
                onClick={() => linkToTransaction(transactionHash)}
              />
            )}
          </Flex.Row>
        </Flex.Row>
        <Flex.Row
          alignItems="center"
          style={{
            gap: '16px',
          }}
        >
          {status === TRANSACTION_STATUS.PROCESSING && (
            <>
              <SpinnerIcon size={20} color={new Color(primaryColor).alpha(0.5).toString()} />
              <Typography.BodyMedium weight="400" color={mode('var(--ink100)', 'var(--white)')}>
                Pending Transaction
              </Typography.BodyMedium>
            </>
          )}
          {status === TRANSACTION_STATUS.SUCCESSED && (
            <>
              <SuccessIcon
                size={20}
                color={primaryColor}
                style={{ backgroundColor: 'var(--white)', overflow: 'hidden', borderRadius: '100%' }}
              />
              <Typography.BodyMedium weight="700" color={primaryColor}>
                Transaction Completed
              </Typography.BodyMedium>
            </>
          )}
          {status === TRANSACTION_STATUS.FAILED && (
            <>
              <ErrorIcon size={20} color={mode('var(--ink100)', 'white')} />
              <Typography.BodyMedium weight="400" color={mode('var(--ink100)', 'var(--white)')}>
                Transaction Failed
              </Typography.BodyMedium>
            </>
          )}
        </Flex.Row>
      </Flex.Column>

      <Spacer size={16} orientation="vertical" />

      <Typography.BodySmall weight="400" color="var(--ink70)" style={{ textAlign: 'center' }}>
        Transaction takes about 30 seconds.
        <br /> You can close this window.
      </Typography.BodySmall>

      <Spacer size={32} orientation="vertical" />

      <Button variant="neutral" onClick={() => closeSendTransaction()}>
        <Typography.BodyMedium>Close</Typography.BodyMedium>
      </Button>
    </Flex.Column>
  );
};
