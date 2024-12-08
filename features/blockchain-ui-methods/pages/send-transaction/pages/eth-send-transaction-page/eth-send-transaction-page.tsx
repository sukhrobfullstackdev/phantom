import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Alert, CallToAction, Spacer } from '@magiclabs/ui';
import { JsonRpcRequestPayload } from 'magic-sdk';
import { useAsyncEffect } from 'usable-react';
import { store } from '~/app/store';
import { UserThunks } from '~/app/store/user/user.thunks';
import { useDispatch, useSelector } from '~/app/ui/hooks/redux-hooks';
import { BackActionButton, CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import styles from './eth-send-transaction-page.less';
import { SystemThunks } from '~/app/store/system/system.thunks';
import { rejectPayload } from '~/app/rpc/utils';
import { useGetNativeTokenBalance } from '~/features/connect-with-ui/hooks/useGetNativeTokenBalance';
import { useGetTokenPrice } from '~/features/connect-with-ui/hooks/useGetTokenPrice';
import { Network } from '~/features/connect-with-ui/components/network';
import { cloneDeep } from '~/app/libs/lodash-utils';
import { sdkErrorFactories } from '~/app/libs/exceptions';
import {
  TokenTransferDetailsType,
  TransactionLineItem,
} from '~/features/connect-with-ui/components/transaction-line-item';
import { InsufficientFundsAlert } from '~/features/connect-with-ui/components/insufficient-funds-alert';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { ToFromAddresses } from '~/features/connect-with-ui/components/to-from-addresses';
import { TransactionSendAmount } from '~/features/connect-with-ui/components/transaction-send-amount';
import {
  FLOW_USDC_TRANSFER,
  getTokenTransferDetails,
  getTransactionType,
  isTransactionValueZero,
  TOKEN_TRANSFER,
  TransactionType,
} from '~/features/connect-with-ui/utils/transaction-type-utils';
import { TransactionTokenIcon } from '~/features/connect-with-ui/components/transaction-token-icon';
import { TrackingButton } from '~/features/connect-with-ui/components/tracking-button';
import { eventData } from '~/features/connect-with-ui/utils/get-login-method';
import {
  putSendTransactionRouteParams,
  setPendingTransactionRouteParams,
  setSendTransactionRouteParams,
} from '~/app/store/user/user.actions';
import { SendTransactionRouteParams } from '~/app/store/user/user.reducer';
import LedgerBalance, { MultiChainTransactionAmountsInterface } from '~/app/libs/ledger-balance';
import { getWalletType, isETHWalletType } from '~/app/libs/network';
import { MultiChainTransactionListItems } from '~/app/constants/ledger-support';
import { MultiChainThunks } from '~/app/store/multiChain/multichian.thunks';
import { AnalyticsActionType } from '~/app/libs/analytics';
import { MC_WALLET, MAGIC_WALLET } from '~/app/constants/route-methods';
import { WalletBalanceBanner } from '~/features/connect-with-ui/components/wallet-balance-banner';
import { ConfirmActionType } from '~/features/confirm-action/types';
import { i18n } from '~/app/libs/i18n';
import { MultiChainInfoContext } from '~/features/connect-with-ui/hooks/multiChainContext';
import {
  ConfirmActionErrorCodes,
  beginActionConfirmation,
  waitForActionConfirmed,
} from '~/features/confirm-action/store/confirm-action.thunks';
import { getLogger } from '~/app/libs/datadog';
import { isRnOrIosSDK } from '~/app/libs/platform';
import { isUnsupportedBrowser } from '~/features/connect-with-ui/utils/device';
import { ActionOtpChallenge } from '../../../../components/action-otp-challenge';
import { isWalletUIRpcMethod } from '~/app/libs/wallet-ui-rpc-methods';
import { getApiKey } from '~/app/libs/api-key';
import { SEND_TRANSACTION_ERROR_TYPES } from '../send-transaction-error-page/send-transaction-error-page';
import { PendingSpinner } from '~/features/native-methods/ui/PendingSpinner';
import { LoadingSpinner } from '~/app/ui/components/widgets/loading-spinner';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { Animate } from '~/features/native-methods/components/animate/animate';
import { MotionDiv } from '~/features/native-methods/components/motion-div/motion-div';

interface SendTransactionPageProps {
  returnToPage?: string;
}

export const EthSendTransactionPage = ({ returnToPage }: SendTransactionPageProps) => {
  const { navigateTo } = useControllerContext();
  const { theme } = useTheme();
  const txObjectFromParams = store.hooks.useSelector(state => state.User.sendTransactionRouteParams);
  const { LAUNCH_DARKLY_FEATURE_FLAGS, CLIENT_FEATURE_FLAGS } = store.hooks.useSelector(state => state.System);
  const [payload, setPayload] = useState(useSelector(state => state.UIThread.payload));
  const [isTxPending, setIsTxPending] = useState(false);
  const [hasEnoughFunds, setHasEnoughFunds] = useState(true);
  const [transactionAmounts, setTransactionAmounts] = useState<MultiChainTransactionAmountsInterface>();
  const [transactionType, setTransactionType] = useState<TransactionType>(undefined);
  const [tokenTransferDetails, setTokenTransferDetails] = useState<TokenTransferDetailsType>();
  const balance: string | undefined = useGetNativeTokenBalance();
  const price: string | undefined = useGetTokenPrice();
  const chainInfo = useContext(MultiChainInfoContext);
  const isConfirmActionFlowEnabled: boolean =
    LAUNCH_DARKLY_FEATURE_FLAGS['is-confirm-action-flow-enabled'] &&
    CLIENT_FEATURE_FLAGS.is_transaction_confirmation_enabled;
  const isActionOtpChallengeEnforced: boolean = LAUNCH_DARKLY_FEATURE_FLAGS['is-action-otp-challenge-enforced'];
  const [confirmUrl, setConfirmUrl] = useState('');
  const dispatch = useDispatch();
  const [showTransactionChallenge, setShowTransactionChallenge] = useState(false);
  const [showTransactionChallengeError, setShowTransactionChallengeError] = useState(false);

  // Mobile: popup only works inside of a useEffect
  useEffect(() => {
    if (!confirmUrl || !isRnOrIosSDK()) return;
    window.open(confirmUrl);
    setConfirmUrl('');
  }, [confirmUrl]);

  const transactionListItems = {
    sendAmount: {
      label: 'Send Amount',
      amount: transactionAmounts?.transactionValue,
      fiat: transactionAmounts?.transactionValueInFiat,
      tooltip: false,
      tokenTransferDetails,
    },
    networkFee: {
      label: 'Network Fee',
      // If we have the transaction value, but not a network fee, there was an error calculating it, so display '--'
      amount:
        transactionAmounts?.transactionValue && !transactionAmounts?.networkFee ? '--' : transactionAmounts?.networkFee,
      fiat: transactionAmounts?.networkFeeInFiat,
      tooltip: true,
    },
    total: {
      label: 'Total',
      amount: transactionAmounts?.total,
      fiat: transactionAmounts?.totalInFiat,
      tooltip: false,
    },
  };

  const filterTransactionListItems = () => {
    return MultiChainTransactionListItems[getWalletType()].map(item => {
      return transactionListItems[item];
    });
  };

  const ledgerBalance = new LedgerBalance();

  // Set `payload` with marshall params if `send` initiated from widget
  useEffect(() => {
    const requestPayload = payload || ({} as JsonRpcRequestPayload);
    if (!requestPayload?.params?.length || !requestPayload?.params?.[0] || !isETHWalletType()) {
      requestPayload.params = [txObjectFromParams];
    }
    setPayload(requestPayload);
    return () => {
      if ((payload?.method === MC_WALLET || payload?.method === MAGIC_WALLET) && isETHWalletType()) {
        // clear params set by txObjectFromParams
        requestPayload.params = [];
      }
      // unset any route params when component unmounts
      store.dispatch(setSendTransactionRouteParams({} as SendTransactionRouteParams));
    };
  }, []);

  // Get transaction type based on payload (erc20 token transfer, eth transfer, etc)
  useAsyncEffect(async () => {
    if (!payload?.params.length) return;
    const txType: TransactionType = await getTransactionType(payload.params[0]);
    setTransactionType(txType);
  }, [payload]);

  // Get transaction details (`amount`, `to`, `symbol`) if erc20 token transfer
  useAsyncEffect(async () => {
    if (!payload?.params.length || transactionType !== TOKEN_TRANSFER) return;
    // We are only displaying the ERC20 token sent, so reject transactions sending ERC20 token & ETH at the same time
    if (transactionType === TOKEN_TRANSFER && !isTransactionValueZero(payload.params[0].value))
      return rejectPayload(payload, sdkErrorFactories.web3.invalidTransaction());
    setTokenTransferDetails(await getTokenTransferDetails(payload.params[0]));
  }, [transactionType, payload]);

  // Get transaction details if USDC transfer on Flow
  useAsyncEffect(async () => {
    if (!payload?.params.length || transactionType !== FLOW_USDC_TRANSFER) return;
    setTokenTransferDetails(await getTokenTransferDetails(payload.params[0]));
  }, [transactionType, payload]);

  // Get values for `value`, `network fee` & `total`
  useAsyncEffect(async () => {
    if (!payload || balance === undefined || !price) return;
    const amounts = await ledgerBalance.calculateTransactionAmounts(
      payload.params[0].value,
      price,
      payload,
      !!(payload?.method === MC_WALLET || payload?.method === MAGIC_WALLET), // construct tx flow
    );
    setTransactionAmounts(amounts);
  }, [payload, balance, price]);

  // Check if user has enough funds for transaction
  // TODO: (later) check balance for ERC20 token transfers
  useEffect(() => {
    if (transactionType === FLOW_USDC_TRANSFER) return;
    if (!transactionAmounts || balance === undefined || !price) return;
    const { total } = transactionAmounts;
    if (ledgerBalance.isGreaterThan(total, balance)) {
      setHasEnoughFunds(false);
    } else {
      setHasEnoughFunds(true);
    }
  }, [transactionAmounts, balance, price]);

  const handleSendTransactionEVM = async () => {
    if (!payload?.params.length) return;
    const hash = await store.dispatch(UserThunks.sendTransactionForUser(payload));
    if (!hash) return rejectPayload(payload, sdkErrorFactories.web3.underpricedReplacementTransaction());
    if (!isWalletUIRpcMethod(payload)) {
      await store.dispatch(SystemThunks.resolveJsonRpcResponse({ payload, result: hash }));
    }
    const params = getParamsForPendingTxPage(hash, payload.params[0]);
    store.dispatch(setPendingTransactionRouteParams(params));
    return navigateTo('wallet-pending-transaction', eventData);
  };

  const handleSendTransactionMultiChain = () => {
    if (!payload?.params) return;
    const multiChainSendFundsPayload = ledgerBalance.getSendFundsPayload()(
      transactionType === FLOW_USDC_TRANSFER ? 'mc_flow_composeSendUsdc' : 'mc_flow_composeSendTransaction',
      payload?.params[0].to,
      payload?.params[0]?.value,
      payload?.params[0]?.from,
    );

    const params = getParamsForPendingTxPage('', payload.params[0]);
    store.dispatch(setPendingTransactionRouteParams(params));

    const transaction = store.dispatch(MultiChainThunks.handleLedgerPayload(multiChainSendFundsPayload));
    transaction.then((result: any) => {
      const resultParams = getParamsForPendingTxPage(result?.events[0]?.transactionId, payload.params[0]);
      store.dispatch(setPendingTransactionRouteParams(cloneDeep(resultParams)));
    });
    navigateTo('wallet-pending-transaction', eventData);
  };

  const handleSendTransaction = async () => {
    if (isETHWalletType()) {
      await handleSendTransactionEVM();
    } else {
      await handleSendTransactionMultiChain();
    }
    getLogger().info('Modal: Send Transaction Succeeded');
  };

  const getParamsForPendingTxPage = (hash, txObject) => {
    if ((transactionType === TOKEN_TRANSFER || transactionType === FLOW_USDC_TRANSFER) && tokenTransferDetails) {
      return {
        to: tokenTransferDetails.to,
        from: txObject.from,
        fiatValue: '',
        tokenAmount: tokenTransferDetails.amount,
        symbol: tokenTransferDetails.symbol,
        hash,
        logo: txObjectFromParams?.logo,
      };
    }
    return {
      to: txObject.to,
      from: txObject.from,
      fiatValue: transactionAmounts?.transactionValueInFiat.toString() || '',
      tokenAmount: '',
      symbol: '',
      hash,
      logo: undefined,
    };
  };

  const displayAlertIfInsufficientFunds = () => {
    return hasEnoughFunds ? null : (
      <InsufficientFundsAlert
        balance={Number(balance || '0x0').toString()}
        total={transactionAmounts?.total}
        price={price}
      />
    );
  };

  const setToAddress = (): string | undefined => {
    if (!transactionType) {
      return;
    }
    if (transactionType === TOKEN_TRANSFER && !tokenTransferDetails) {
      return;
    }
    if (transactionType === TOKEN_TRANSFER && tokenTransferDetails) {
      return tokenTransferDetails.to;
    }
    return payload?.params[0]?.to || txObjectFromParams?.to || '';
  };

  const renderTransactionLineItems = () => {
    return filterTransactionListItems().map(
      ({ label, amount, fiat, tooltip, tokenTransferDetails: tokenTransferData }) => {
        return ((transactionType === TOKEN_TRANSFER || transactionType === FLOW_USDC_TRANSFER) && label === 'Total') ||
          amount === '0' ? null : (
          <div key={label}>
            <Spacer size={10} orientation="vertical" />
            {label === 'Total' && <div className={styles.line} />}
            <TransactionLineItem
              label={label}
              amount={amount}
              fiat={fiat}
              tooltip={tooltip}
              isLowBalance={!hasEnoughFunds}
              tokenTransferDetails={tokenTransferData}
            />
          </div>
        );
      },
    );
  };

  const { userAgent: ua } = navigator;
  const handleSendButtonClick = async () => {
    getLogger().info('Modal: Send Transaction Button Clicked');
    if (!payload) return;
    setIsTxPending(true);
    try {
      if (isConfirmActionFlowEnabled) {
        let confirmWindow;
        if (!isRnOrIosSDK()) confirmWindow = window.open(`${window.location.origin}/confirm-action?ak=${getApiKey()}`);
        const txnParams = getParamsForPendingTxPage('', payload.params[0]);
        const chainInfoUri = `${chainInfo?.blockExplorer}/${isETHWalletType() ? 'address' : 'account'}`;
        const curl = await dispatch(
          beginActionConfirmation(ConfirmActionType.SendTransaction, {
            amount:
              (ledgerBalance.displayAmount(transactionAmounts?.transactionValue || '0') as number).toString() || '',
            token: chainInfo?.currency || '',
            from: txnParams.from,
            to: txnParams.to,
            fiat_value: txnParams.fiatValue,
            token_amount: txnParams.tokenAmount,
            symbol: txnParams.symbol,
            transaction_type: transactionType,
            chain_info_uri: chainInfoUri,
          }),
        );
        setConfirmUrl(curl);
        if (confirmWindow) confirmWindow.location = curl;
        await dispatch(waitForActionConfirmed());
      }
      handleSendTransaction();
    } catch (e) {
      if (e === ConfirmActionErrorCodes.USER_REJECTED_CONFIRMATION && payload) {
        return rejectPayload(payload, sdkErrorFactories.magic.userRejectAction());
      }
      // TODO: Show error state, action expired and what not.
      setIsTxPending(false);
    }
  };

  const isBrowserNotAvailable = useMemo(() => {
    const { userAgent } = navigator;
    return isUnsupportedBrowser(userAgent);
  }, [isActionOtpChallengeEnforced]);

  useEffect(() => {
    if (isBrowserNotAvailable) {
      store.dispatch(putSendTransactionRouteParams({ errorType: SEND_TRANSACTION_ERROR_TYPES.UNSUPPORTED_BROWSER }));
      navigateTo('eth-send-transaction-error', eventData);
      return;
    }
  }, []);

  return (
    <Animate exitBeforeEnter initial={false}>
      {isBrowserNotAvailable ||
      !transactionAmounts ||
      !payload?.params[0] ||
      !(txObjectFromParams?.from || payload?.params[0]?.from) ? (
        <MotionDiv key="loading-send-transaction">
          <PendingSpinner />
        </MotionDiv>
      ) : (
        <MotionDiv key="send-transaction-content">
          {showTransactionChallenge && (
            <ActionOtpChallenge
              transactionAmount={transactionAmounts?.transactionValueInFiat || 0}
              onSuccess={() => {
                setIsTxPending(true);
                setShowTransactionChallenge(false);
                handleSendTransaction();
              }}
              onError={() => {
                setIsTxPending(false);
                setShowTransactionChallenge(false);
                setShowTransactionChallengeError(true);
              }}
            />
          )}
          <ModalHeader
            leftAction={
              returnToPage?.length && !isTxPending ? (
                <BackActionButton onClick={() => navigateTo(returnToPage, eventData)} />
              ) : undefined
            }
            rightAction={isTxPending ? undefined : <CancelActionButton />}
            header={<Network />}
          />
          <Spacer size={15} orientation="vertical" />
          <WalletBalanceBanner />
          <Spacer size={20} orientation="vertical" />
          <TransactionTokenIcon logo={txObjectFromParams?.logo} transactionType={transactionType} />
          <Spacer size={15} orientation="vertical" />
          <TransactionSendAmount
            fiatValue={transactionAmounts?.transactionValueInFiat}
            tokenTransferDetails={
              transactionType === TOKEN_TRANSFER || transactionType === FLOW_USDC_TRANSFER
                ? tokenTransferDetails
                : undefined
            }
          />
          <Spacer size={15} orientation="vertical" />
          <ToFromAddresses to={setToAddress()} from={payload?.params[0]?.from || txObjectFromParams?.from} />
          <Spacer size={20} orientation="vertical" />
          {renderTransactionLineItems()}
          <Spacer size={20} orientation="vertical" />
          {displayAlertIfInsufficientFunds()}
          {showTransactionChallengeError && (
            <Alert type="warning" icon={false}>
              The security code you entered is incorrect. Please try again.
            </Alert>
          )}
          <Spacer size={30} orientation="vertical" />
          {hasEnoughFunds ? (
            <div style={{ textAlign: 'center' }}>
              <TrackingButton actionName={!hasEnoughFunds || isTxPending ? '' : AnalyticsActionType.TransactionSent}>
                <CallToAction
                  disabled={!hasEnoughFunds || isTxPending || !transactionAmounts?.networkFee}
                  onClick={
                    isActionOtpChallengeEnforced
                      ? () => {
                          setShowTransactionChallengeError(false);
                          setShowTransactionChallenge(true);
                        }
                      : handleSendButtonClick
                  }
                  style={{ width: '100%' }}
                  color="primary"
                  className={styles.ctaBtn}
                >
                  {isTxPending ? (
                    <LoadingSpinner size={20} strokeSize={2} color={theme.isLightTheme ? '#FFFFFF' : '#000000'} />
                  ) : (
                    'Send'
                  )}
                </CallToAction>
              </TrackingButton>
              {isConfirmActionFlowEnabled && (
                <>
                  <Spacer size={16} orientation="vertical" />
                  <div
                    style={{
                      fontSize: '12px',
                      width: '274px',
                      margin: 'auto',
                      lineHeight: '20px',
                      color: '#77767A',
                    }}
                  >
                    {i18n.generic.for_security_reasons_a_new_tab_will_open.toString()}
                  </div>
                </>
              )}
            </div>
          ) : null}
        </MotionDiv>
      )}
    </Animate>
  );
};

EthSendTransactionPage.defaultProps = {
  returnToPage: '',
};
