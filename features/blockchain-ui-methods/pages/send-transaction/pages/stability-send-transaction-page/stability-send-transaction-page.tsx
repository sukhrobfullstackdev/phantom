import React, { Suspense } from 'react';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { PendingSpinner } from '~/features/native-methods/ui/PendingSpinner';
import { useChainInfo } from '~/features/blockchain-ui-methods/hooks/use-chain-info';
import { useNetworkFee } from '~/features/blockchain-ui-methods/hooks/use-network-fee';
import { SendTransactionLayout } from '../../components/send-transaction-layout';
import { useSendTransactionParams } from '../../hooks/use-send-transaction-params';
import { useTokenPrice } from '~/features/blockchain-ui-methods/hooks/use-token-price';
import { StabilitySendTransactionForm } from '../../components/stability-send-transaction-form';
import { store } from '~/app/store';
import { useTransactionHash } from '../../hooks/use-transaction-hash';
import { UserThunks } from '~/app/store/user/user.thunks';
import { SendTransactionErrorPage } from '../send-transaction-error-page/send-transaction-error-page';
import { getChainId, getWalletType } from '~/app/libs/network';
import { useConfirmTransaction } from '~/features/hooks/use-confirm-transaction';
import { ConfirmActionType } from '~/features/confirm-action/types';
import { Animate } from '~/features/native-methods/components/animate/animate';
import { MotionDiv } from '~/features/native-methods/components/motion-div/motion-div';
import { ErrorBoundary } from '~/app/libs/exceptions/error-boundary';

interface SendTransactionPageProps {
  returnToPage?: string;
}

export const StabilitySendTransactionPage = ({ returnToPage }: SendTransactionPageProps) => {
  return (
    <ErrorBoundary fallback={<SendTransactionErrorPage />}>
      <Suspense fallback={<PendingSpinner />}>
        <SendTransactionLayout returnToPage={returnToPage}>
          <Animate exitBeforeEnter>
            <Resolved />
          </Animate>
        </SendTransactionLayout>
      </Suspense>
    </ErrorBoundary>
  );
};

const Resolved = () => {
  const { navigateTo } = useControllerContext();

  const { chainInfo } = useChainInfo();
  const { sendTransactionParams } = useSendTransactionParams();

  const { tokenPrice } = useTokenPrice();
  const { networkFee } = useNetworkFee();
  const { confirmTransaction } = useConfirmTransaction();

  const { setTransactionHash } = useTransactionHash();

  const handleOnSubmit = async () => {
    const response = await confirmTransaction({
      actionType: ConfirmActionType.SendTransaction,
      payload: {
        from: sendTransactionParams.from.toString(),
        to: sendTransactionParams.to?.toString(),
        value: sendTransactionParams.value.toString(),
        tokenPrice,
        networkFee,
        walletType: getWalletType(),
        chainId: getChainId(),
        chain_info_uri: `${chainInfo.blockExplorer}/address/`,
      },
    });

    if (!response) {
      throw new Error('Closed');
    }

    const { payload } = store.getState().UIThread;
    if (!payload) {
      throw new Error('Something went wrong. Payload is empty');
    }

    const hash = await store.dispatch(UserThunks.sendTransactionForUser(payload));
    if (!hash) {
      throw new Error('Failed to send transaction');
    }

    setTransactionHash(hash);
    navigateTo('stability-pending-transaction');
  };

  return (
    <MotionDiv
      key="send-transaction-content"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <StabilitySendTransactionForm
        from={sendTransactionParams.from.toString()}
        to={sendTransactionParams.to?.toString()}
        value={sendTransactionParams.value.toString()}
        tokenPrice={tokenPrice}
        networkFee={networkFee}
        chainInfo={chainInfo}
        onSubmit={handleOnSubmit}
      />
    </MotionDiv>
  );
};
