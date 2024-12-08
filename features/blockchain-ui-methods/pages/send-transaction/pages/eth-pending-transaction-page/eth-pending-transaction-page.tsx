import React, { useEffect, useState } from 'react';
import { CallToAction, Flex, Spacer, Typography } from '@magiclabs/ui';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import styles from './eth-pending-transaction-page.less';
import { ethereumProxy } from '~/app/services/json-rpc/ethereum-proxy';
import { Network } from '~/features/connect-with-ui/components/network';
import { getPayloadId } from '~/features/connect-with-ui/utils/get-payload-id';
import { ToFromAddresses } from '~/features/connect-with-ui/components/to-from-addresses';
import { resolvePayload } from '~/app/rpc/utils';
import { useSelector } from '~/app/ui/hooks/redux-hooks';
import { TransactionStatus } from '~/features/connect-with-ui/components/transaction-status';
import { TransactionSendAmount } from '~/features/connect-with-ui/components/transaction-send-amount';
import { TransactionTokenIcon } from '~/features/connect-with-ui/components/transaction-token-icon';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { isMagicWalletDapp } from '~/app/libs/connect-utils';
import { eventData } from '~/features/connect-with-ui/utils/get-login-method';
import { store } from '~/app/store';
import { isETHWalletType } from '~/app/libs/network';
import { WalletBalanceBanner } from '~/features/connect-with-ui/components/wallet-balance-banner';
import { isWalletUIRpcMethod } from '~/app/libs/wallet-ui-rpc-methods';
import { MAGIC_SHOW_SEND_TOKENS_UI } from '~/app/constants/route-methods';
import { ETH_TRANSFER, TOKEN_TRANSFER } from '~/features/connect-with-ui/utils/transaction-type-utils';

export const EthPendingTransactionPage = () => {
  const [isTransactionCompleted, setIsTransactionCompleted] = useState(false);
  const [watchUpdate, setWatchUpdate] = useState(0);
  const params = store.hooks.useSelector(state => state.User.pendingTransactionRouteParams);
  const payload = useSelector(state => state.UIThread.payload);
  const { navigateTo } = useControllerContext();

  useEffect(() => {
    if (isETHWalletType()) {
      if (!params?.hash) return;
      const checkForTransactionReceipt = async () => {
        const result = await ethereumProxy({
          id: getPayloadId(),
          jsonrpc: '2.0',
          method: 'eth_getTransactionReceipt',
          params: [params.hash],
        });
        if (!result) return;
        setIsTransactionCompleted(true);
        clearInterval(txReceiptPoller);
      };
      const txReceiptPoller = setInterval(checkForTransactionReceipt, 3000);
      return () => clearInterval(txReceiptPoller);
    }
    const checkUpdate = () => {
      if (!params?.hash) {
        setWatchUpdate(Date.now());
        return;
      }
      setIsTransactionCompleted(true);
      clearInterval(txHashPoller);
    };
    const txHashPoller = setInterval(checkUpdate, 3000);
    return () => clearInterval(txHashPoller);
  }, [params]);

  const navigateToWallet = () => {
    if (payload?.method === MAGIC_SHOW_SEND_TOKENS_UI) {
      navigateTo('wallet-token-selection', eventData);
    } else {
      navigateTo('wallet-home', eventData);
    }
  };

  const closeWidget = () => {
    return payload ? resolvePayload(payload, true) : null;
  };

  const transferStatuses = [
    {
      message: 'Transfer Started',
      isCompleted: true,
      isShowLink: isETHWalletType(),
    },
    {
      message: isTransactionCompleted ? 'Transfer Complete' : 'Sending Funds',
      isCompleted: isTransactionCompleted,
      isShowLink: !isETHWalletType(),
    },
  ];

  return (
    <>
      <ModalHeader header={<Network />} />
      <Spacer size={15} orientation="vertical" />
      <WalletBalanceBanner />
      <Spacer size={20} orientation="vertical" />
      <TransactionTokenIcon logo={params?.logo} transactionType={params?.tokenAmount ? TOKEN_TRANSFER : ETH_TRANSFER} />
      <Spacer size={15} orientation="vertical" />
      {params && (
        <TransactionSendAmount
          fiatValue={params.fiatValue}
          tokenTransferDetails={
            params.symbol ? { to: params.to, amount: params.tokenAmount, symbol: params.symbol } : undefined
          }
        />
      )}
      <Spacer size={15} orientation="vertical" />
      <ToFromAddresses to={params?.to} from={params?.from} />
      <Spacer size={35} orientation="vertical" />
      <Flex.Column justifyContent="center">
        <Flex.Column style={{ textAlign: 'left' }}>
          <span style={{ width: 'fit-content', margin: 'auto' }}>
            {transferStatuses.map(({ message, isCompleted, isShowLink }) => {
              return (
                <div key={message}>
                  <TransactionStatus
                    message={message as 'Transfer Started' | 'Transfer Complete' | 'Sending Funds'}
                    isCompleted={isCompleted}
                    isShowLink={isShowLink}
                    hash={params?.hash}
                  />
                  <Spacer size={10} orientation="vertical" />
                </div>
              );
            })}
          </span>
        </Flex.Column>
        <Spacer size={20} orientation="vertical" />
        <Typography.BodySmall className={styles.note} weight="400">
          Transfers take about 30 seconds. <br />
          {isMagicWalletDapp() || isWalletUIRpcMethod(payload)
            ? 'You can leave this page.'
            : 'You can close this window.'}
        </Typography.BodySmall>
        <Spacer size={35} orientation="vertical" />
        {isMagicWalletDapp() || isWalletUIRpcMethod(payload) ? (
          <CallToAction className={styles.ctaBtn} onClick={navigateToWallet}>
            Back to wallet
          </CallToAction>
        ) : (
          <CallToAction
            className={styles.ctaBtn}
            onClick={() => {
              closeWidget();
              // DO NOT REMOVE THIS NAVIGATETO - [SC75856]
              navigateTo('wallet-send-transaction');
            }}
          >
            Close
          </CallToAction>
        )}
      </Flex.Column>
    </>
  );
};
