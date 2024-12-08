import React from 'react';
import { createFeatureModule } from '~/features/framework';
import { RpcRouteConfig } from '~/app/rpc/utils/rpc-router';
import { showUI } from '~/app/rpc/controllers/ui.controller';
import { atomic } from '~/app/rpc/controllers/atomic-lock.controller';
import { Modal } from '~/app/ui/components/layout/modal';
import { useActiveControlFlowErrorCode } from '~/app/ui/hooks/ui-thread-hooks';
import { useController } from '~/app/ui/hooks/use-controller';
import { useGenericErrorPages } from '~/app/ui/components/partials/pending-modal/generic-errors';
import { connectStore } from '~/features/connect-with-ui/store';
import { hydrateUserOrReject } from '~/app/rpc/controllers/user.controller';
import { redirectThirdPartyWallet, trackPageMiddleware } from '~/features/connect-with-ui/connect-with-ui.controller';
import { MultiChainInfo } from '~/features/connect-with-ui/hooks/multiChainContext';
import { store } from '~/app/store';
import { isUnsupportedBrowser } from '~/features/connect-with-ui/utils/device';
import { putSendTransactionRouteParams } from '~/app/store/user/user.actions';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WalletFiatOnRampSelectionPage } from '../shared/wallet-fiat-onramp-selection-page';
import { WalletFiatOnRampOnRamper } from '../shared/wallet-fiat-onramp-clients/wallet-fiat-onramp-on-ramper';
import { WalletFiatOnrampSardine } from '../shared/wallet-fiat-onramp-clients/wallet-fiat-onramp-sardine';
import { WalletFiatOnrampPaypal } from '../shared/wallet-fiat-onramp-clients/wallet-fiat-onramp-paypal';
import { WalletFiatOnrampStripe } from '../shared/wallet-fiat-onramp-clients/wallet-fiat-onramp-stripe';
import { WalletFiatOnrampSuccessPage } from '../shared/wallet-fiat-onramp-success-page';
import { WalletFiatOnrampErrorPage } from '../shared/wallet-fiat-onramp-error-page';
import {
  EthPendingTransactionPage,
  EthSendTransactionPage,
  SEND_TRANSACTION_ERROR_TYPES,
  SendTransactionErrorPage,
  SendTransactionPage,
  StabilityPendingTransactionPage,
  StabilitySendTransactionPage,
} from './pages';
import { marshallSendTransactionParams } from './middlewares';

function useSendTransactionPages() {
  const { LAUNCH_DARKLY_FEATURE_FLAGS, CLIENT_FEATURE_FLAGS } = store.hooks.useSelector(state => {
    return state.System;
  });

  const isFiatOnRampEnabled =
    LAUNCH_DARKLY_FEATURE_FLAGS['is-fiat-on-ramp-enabled'] && CLIENT_FEATURE_FLAGS.is_fiat_onramp_enabled;

  const isFiatOnRampSardineEnabled = LAUNCH_DARKLY_FEATURE_FLAGS['is-fiat-on-ramp-sardine-enabled'];
  const isFiatOnRampStripeEnabled = LAUNCH_DARKLY_FEATURE_FLAGS['is-fiat-on-ramp-stripe-enabled'];
  const isFiatOnRampPayPalEnabled = LAUNCH_DARKLY_FEATURE_FLAGS['is-fiat-on-ramp-paypal-enabled'];

  const { routes, createPageResolver } = useController([
    {
      id: 'send-transaction',
      content: <SendTransactionPage />,
    },
    {
      id: 'send-transaction-error',
      content: <SendTransactionErrorPage />,
    },
    {
      id: 'eth-send-transaction',
      content: <EthSendTransactionPage />,
    },
    {
      id: 'eth-pending-transaction',
      content: <EthPendingTransactionPage />,
    },
    {
      id: 'stability-send-transaction',
      content: <StabilitySendTransactionPage />,
    },
    {
      id: 'stability-pending-transaction',
      content: <StabilityPendingTransactionPage />,
    },
    {
      id: 'wallet-send-transaction',
      content: <EthSendTransactionPage />,
    },
    { id: 'wallet-pending-transaction', content: <EthPendingTransactionPage /> },
    {
      id: 'wallet-fiat-onramp-selection',
      content: (
        <WalletFiatOnRampSelectionPage
          isFiatOnRampEnabled={isFiatOnRampEnabled}
          isFiatOnRampSardineEnabled={isFiatOnRampSardineEnabled}
          isFiatOnRampStripeEnabled={isFiatOnRampStripeEnabled}
          isFiatOnRampPayPalEnabled={isFiatOnRampPayPalEnabled}
        />
      ),
    },
    {
      id: 'wallet-fiat-onramp-on-ramper',
      content: (
        <WalletFiatOnRampOnRamper
          isFiatOnRampEnabled={isFiatOnRampEnabled}
          isFiatOnRampSardineEnabled={isFiatOnRampSardineEnabled}
          isFiatOnRampStripeEnabled={isFiatOnRampStripeEnabled}
        />
      ),
    },
    {
      id: 'wallet-fiat-onramp-sardine',
      content: <WalletFiatOnrampSardine isFiatOnRampEnabled={isFiatOnRampEnabled} />,
    },
    {
      id: 'wallet-fiat-onramp-paypal',
      content: <WalletFiatOnrampPaypal />,
    },
    { id: 'wallet-fiat-onramp-stripe', content: <WalletFiatOnrampStripe /> },
    { id: 'wallet-fiat-onramp-success', content: <WalletFiatOnrampSuccessPage /> },
    { id: 'wallet-fiat-onramp-error', content: <WalletFiatOnrampErrorPage /> },
  ]);
  const resolver = createPageResolver(() => {
    const { userAgent: ua } = navigator;
    if (isUnsupportedBrowser(ua)) {
      store.dispatch(putSendTransactionRouteParams({ errorType: SEND_TRANSACTION_ERROR_TYPES.UNSUPPORTED_BROWSER }));
      return 'send-transaction-error';
    }
  });

  return { routes, resolver };
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: false,
      suspense: true,
    },
  },
});

const PageRender = () => {
  const globalError = useActiveControlFlowErrorCode();
  const genericErrorPages = useGenericErrorPages(globalError);
  const sendTransactionPages = useSendTransactionPages();

  const { page, resolvePage } = useController([...sendTransactionPages.routes, ...genericErrorPages.routes]);
  resolvePage(genericErrorPages.resolver, sendTransactionPages.resolver);

  return (
    <QueryClientProvider client={queryClient}>
      <connectStore.Provider>
        <Modal.RPC>
          <div id="modal-portal">
            <MultiChainInfo>{page}</MultiChainInfo>
          </div>
        </Modal.RPC>
      </connectStore.Provider>
    </QueryClientProvider>
  );
};

const mwui_eth_sendTransaction: RpcRouteConfig = {
  middlewares: [
    atomic(),
    redirectThirdPartyWallet,
    hydrateUserOrReject,
    marshallSendTransactionParams,
    trackPageMiddleware,
    showUI.force,
  ],
  render: () => <PageRender />,
};

export default createFeatureModule.RPC(mwui_eth_sendTransaction);
