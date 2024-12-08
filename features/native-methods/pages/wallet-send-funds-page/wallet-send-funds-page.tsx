import { CallToAction, Skeleton, Spacer } from '@magiclabs/ui';
import { ethers } from 'ethers';
import React, { useCallback, useEffect, useState } from 'react';
import { useAsyncEffect } from 'usable-react';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { BasePage } from '~/features/connect-with-ui/components/base-page/base-page';
import { BackActionButton, CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { Network } from '~/features/connect-with-ui/components/network';
import { WalletAmountAvailable } from '~/features/connect-with-ui/components/wallet-amount-available';
import { WalletSendAddress } from '~/features/connect-with-ui/components/wallet-send-address';
import { WalletSendAmount } from '~/features/connect-with-ui/components/wallet-send-amount';
import { store } from '~/app/store';
import { calculateNetworkFee } from '~/app/libs/web3-utils';
import { useGetNativeTokenBalance } from '~/features/connect-with-ui/hooks/useGetNativeTokenBalance';
import { TrackingButton } from '~/features/connect-with-ui/components/tracking-button';
import { eventData } from '~/features/connect-with-ui/utils/get-login-method';
import { setSendFundsRouteParams, setSendTransactionRouteParams } from '~/app/store/user/user.actions';
import { SendFundsRouteParams } from '~/app/store/user/user.reducer';
import { MC_WALLET } from '~/app/constants/route-methods';
import { isETHWalletType } from '~/app/libs/network';
import { AnalyticsActionType } from '~/app/libs/analytics';
import { add } from '~/features/connect-with-ui/utils/bn-math';
import { useGetTokenPrice } from '~/features/connect-with-ui/hooks/useGetTokenPrice';
import { ConstructTransactionNetworkFee } from '../construct-transaction-network-fee';

interface WalletAddressState {
  address: string | number;
  isValid: boolean;
}

interface SendAmountState {
  value: string | number;
  isValid: boolean;
}

export const WalletSendFundsPage = () => {
  const { navigateTo } = useControllerContext();
  const [isLoading, setIsLoading] = useState(true);
  const [sendToWalletAddress, setSendToWalletAddress] = useState<WalletAddressState>({ address: '', isValid: false });
  const [networkFeeInWei, setNetworkFeeInWei] = useState(0);
  const [sendAmount, setSendAmount] = useState<SendAmountState>({ value: 0, isValid: false });
  const [errorMessage, setErrorMessage] = useState('');
  const [isSendTransactionValid, setIsSendTransactionValid] = useState(false);
  const price: string = useGetTokenPrice() || '';
  const walletAddress = store.hooks.useSelector(state => state.Auth.userKeys.publicAddress);
  const balance: string = useGetNativeTokenBalance() || '';
  const params = store.hooks.useSelector(state => state.User.sendFundsRouteParams);
  const [isInputFormatFiat, setIsInputFormatFiat] = useState<boolean>(
    !params?.contractAddress && !params?.isSendFlowUsdc,
  );
  useEffect(() => {
    return () => {
      // unset any route params when component unmounts
      store.dispatch(setSendFundsRouteParams({} as SendFundsRouteParams));
    };
  }, []);

  const formatData = (): string | number => {
    if (!params?.contractAddress) return '0x';
    const amount: string | number = sendAmount.value;
    // `functionSig` calculated from `web3.sha3('transfer(address,uint256)')`
    const functionSig = '0xa9059cbb';
    const functionSigPadding = '000000000000000000000000';
    const formattedAmount = ethers.utils.hexlify(amount).substring(2); // strip beginning '0x'
    const amountPaddingLength = 64 - formattedAmount.length;
    const amountPadding = '0'.repeat(amountPaddingLength);
    const to = sendToWalletAddress.address.toString().substring(2); // strip beginning '0x'
    return `${functionSig}${functionSigPadding}${to}${amountPadding}${formattedAmount}`;
  };

  const onClickSendTransaction = () => {
    store.dispatch(
      setSendTransactionRouteParams({
        to: params?.contractAddress || sendToWalletAddress.address,
        from: walletAddress!,
        value: params?.contractAddress ? '0x0' : sendAmount.value,
        data: isETHWalletType() ? formatData() : undefined,
        logo: params?.logo,
        isSendFlowUsdc: params?.isSendFlowUsdc,
      }),
    );

    navigateTo('wallet-send-transaction', eventData);
  };

  const walletAddressCallback = useCallback(address => {
    setSendToWalletAddress(address);
  }, []);

  const sendAmountCallback = useCallback(amount => {
    setSendAmount(amount);
  }, []);

  const setIsLoadingCallback = useCallback(() => {
    setIsLoading(!isLoading);
  }, []);

  useEffect(() => {
    setIsSendTransactionValid(sendAmount.isValid && sendToWalletAddress.isValid);
  }, [sendAmount, sendToWalletAddress]);

  useAsyncEffect(async () => {
    // Only need to calculate network fee if sending native token
    if (params?.contractAddress) {
      setNetworkFeeInWei(0);
      return setIsLoadingCallback();
    }

    if (isETHWalletType()) {
      const networkFee = await calculateNetworkFee(
        {
          method: MC_WALLET,
          params: [
            {
              to: walletAddress,
              from: walletAddress,
              value: balance,
            },
          ],
        },
        true,
      );
      setNetworkFeeInWei(Number(networkFee));
    } else {
      setNetworkFeeInWei(0);
    }

    setIsLoadingCallback();
    return () => {};
  }, [balance]);

  const renderCallToAction = () => {
    if (!isLoading)
      return (
        <TrackingButton actionName={AnalyticsActionType.ComposeTransactionFinish}>
          <CallToAction
            disabled={!isSendTransactionValid || !!errorMessage}
            onClick={onClickSendTransaction}
            style={{ width: '100%' }}
          >
            Next
          </CallToAction>
        </TrackingButton>
      );

    return <Skeleton shape="pill" height="46px" width="336px" />;
  };

  return (
    <>
      <ModalHeader
        leftAction={<BackActionButton onClick={() => navigateTo('wallet-token-selection', eventData)} />}
        rightAction={<CancelActionButton />}
        header={<Network />}
      />
      <BasePage>
        <>
          <Spacer size={16} orientation="vertical" />
          <WalletAmountAvailable
            logo={params?.logo}
            contractAddress={params?.contractAddress}
            decimals={params?.decimals}
            symbol={params?.symbol}
            balance={params?.balance}
            isInputFormatFiat={isInputFormatFiat}
            isSendFlowUsdc={params?.isSendFlowUsdc}
          />
          <Spacer size={24} orientation="vertical" />
          <WalletSendAddress onChangeWalletAddressHandler={walletAddressCallback} isLoading={isLoading} />
          <Spacer size={24} orientation="vertical" />
          <WalletSendAmount
            errorMessage={errorMessage}
            setErrorMessage={setErrorMessage}
            onChangeSendAmountHandler={sendAmountCallback}
            networkFee={networkFeeInWei}
            isLoading={isLoading}
            symbol={params?.symbol}
            balance={params?.balance}
            decimals={params?.decimals}
            contractAddress={params?.contractAddress}
            isInputFormatFiat={isInputFormatFiat}
            isSendFlowUsdc={params?.isSendFlowUsdc}
            setIsInputFormatFiat={setIsInputFormatFiat}
          />
          {!isLoading ? (
            <ConstructTransactionNetworkFee
              networkFeeInWei={networkFeeInWei}
              isInputFormatFiat={isInputFormatFiat}
              price={price}
            />
          ) : null}
          <Spacer size={32} orientation="vertical" />
          {renderCallToAction()}
        </>
      </BasePage>
    </>
  );
};
