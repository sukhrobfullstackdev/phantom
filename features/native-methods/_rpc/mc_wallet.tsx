import React, { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createFeatureModule } from '~/features/framework';
import { RpcRouteConfig } from '~/app/rpc/utils/rpc-router';
import { showUI } from '~/app/rpc/controllers/ui.controller';
import { atomic } from '~/app/rpc/controllers/atomic-lock.controller';
import { Modal } from '~/app/ui/components/layout/modal';
import { useActiveControlFlowErrorCode, useUIThreadPayload } from '~/app/ui/hooks/ui-thread-hooks';
import { useController } from '~/app/ui/hooks/use-controller';
import { useGenericErrorPages } from '~/app/ui/components/partials/pending-modal/generic-errors';
import { connectStore } from '~/features/connect-with-ui/store';
import { nativeMethodsStore } from '~/features/native-methods/store/native-methods.store';
import { WalletHomePage } from '~/features/native-methods/pages/wallet-home-page';
import { hydrateUserOrReject } from '~/app/rpc/controllers/user.controller';
import { MultiChainInfo } from '~/features/connect-with-ui/hooks/multiChainContext';
import { trackPageMiddleware } from '~/features/connect-with-ui/connect-with-ui.controller';

// Import UI Pages
import { WalletExportPage } from '../pages/wallet-export-page';
import { TokenSelectionPage } from '../pages/token-selection-page';
import { WalletReceiveFundsPage } from '../pages/wallet-receive-funds-page';
import { WalletSendFundsPage } from '../pages/wallet-send-funds-page';
import { WalletAccountInfoPage } from '../pages/wallet-account-info-page';
import { WalletExportRedirectPage } from '../pages/wallet-export-redirect-page';
import { WalletExportAgreementPage } from '../pages/wallet-export-agreement-page';

// Import Shared UI Pages
import { WalletFiatOnRampSelectionPage } from '~/features/blockchain-ui-methods/pages/shared/wallet-fiat-onramp-selection-page';
import { WalletFiatOnRampOnRamper } from '~/features/blockchain-ui-methods/pages/shared/wallet-fiat-onramp-clients/wallet-fiat-onramp-on-ramper';
import { WalletFiatOnrampSardine } from '~/features/blockchain-ui-methods/pages/shared/wallet-fiat-onramp-clients/wallet-fiat-onramp-sardine';
import { WalletFiatOnrampStripe } from '~/features/blockchain-ui-methods/pages/shared/wallet-fiat-onramp-clients/wallet-fiat-onramp-stripe';
import { WalletFiatOnrampSuccessPage } from '~/features/blockchain-ui-methods/pages/shared/wallet-fiat-onramp-success-page';
import { WalletFiatOnrampErrorPage } from '~/features/blockchain-ui-methods/pages/shared/wallet-fiat-onramp-error-page';
import { rejectIfWalletUINotEnabled } from '~/app/rpc/controllers/feature-route.controller';
import { CollectibleDetailsPage } from '~/features/native-methods/pages/collectible-details-page';
import { store } from '~/app/store';
import { WalletFiatOnrampPaypal } from '~/features/blockchain-ui-methods/pages/shared/wallet-fiat-onramp-clients/wallet-fiat-onramp-paypal';
import {
  EthPendingTransactionPage,
  EthSendTransactionPage,
} from '~/features/blockchain-ui-methods/pages/send-transaction/pages';
import { globalQueryClient } from '../lib/query/global-query-client';

export function useMagicWalletPages() {
  const { LAUNCH_DARKLY_FEATURE_FLAGS, CLIENT_FEATURE_FLAGS } = store.hooks.useSelector(state => {
    return state.System;
  });

  const isNftViewerEnabled: boolean =
    LAUNCH_DARKLY_FEATURE_FLAGS['is-nft-viewer-enabled'] && CLIENT_FEATURE_FLAGS.is_nft_viewer_enabled;

  const isNftTransferEnabled: boolean =
    LAUNCH_DARKLY_FEATURE_FLAGS['is-nft-transfer-enabled'] && CLIENT_FEATURE_FLAGS.is_nft_transfer_enabled;

  const isFiatOnRampEnabled: boolean =
    LAUNCH_DARKLY_FEATURE_FLAGS['is-fiat-on-ramp-enabled'] && CLIENT_FEATURE_FLAGS.is_fiat_onramp_enabled;

  const isFiatOnRampSardineEnabled: boolean = LAUNCH_DARKLY_FEATURE_FLAGS['is-fiat-on-ramp-sardine-enabled'];
  const isFiatOnRampStripeEnabled: boolean = LAUNCH_DARKLY_FEATURE_FLAGS['is-fiat-on-ramp-stripe-enabled'];
  const isFiatOnRampPayPalEnabled: boolean = LAUNCH_DARKLY_FEATURE_FLAGS['is-fiat-on-ramp-paypal-enabled'];
  const isSendFundsEnabled: boolean = LAUNCH_DARKLY_FEATURE_FLAGS['is-send-funds-enabled'];

  const { routes, createPageResolver } = useController([
    {
      id: 'wallet-home',
      content: (
        <WalletHomePage
          isNftViewerEnabled={isNftViewerEnabled}
          isFiatOnRampEnabled={isFiatOnRampEnabled}
          isSendFundsEnabled={isSendFundsEnabled}
        />
      ),
    },
    { id: 'wallet-receive-funds', content: <WalletReceiveFundsPage /> },
    {
      id: 'wallet-token-selection',
      content: <TokenSelectionPage />,
    },
    { id: 'wallet-send-funds', content: <WalletSendFundsPage /> },
    {
      id: 'wallet-send-transaction',
      content: <EthSendTransactionPage returnToPage="wallet-token-selection" />,
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
      id: 'wallet-fiat-onramp-paypal',
      content: <WalletFiatOnrampPaypal />,
    },
    { id: 'wallet-account-info', content: <WalletAccountInfoPage /> },
    { id: 'wallet-export', content: <WalletExportPage /> },
    {
      id: 'wallet-fiat-onramp-sardine',
      content: <WalletFiatOnrampSardine isFiatOnRampEnabled={isFiatOnRampEnabled} />,
    },
    { id: 'wallet-fiat-onramp-stripe', content: <WalletFiatOnrampStripe /> },
    { id: 'wallet-fiat-onramp-success', content: <WalletFiatOnrampSuccessPage /> },
    { id: 'wallet-fiat-onramp-error', content: <WalletFiatOnrampErrorPage /> },
    { id: 'wallet-export-redirect', content: <WalletExportRedirectPage /> },
    { id: 'wallet-export-agreement', content: <WalletExportAgreementPage /> },
    { id: 'collectible-details', content: <CollectibleDetailsPage isNftTransferEnabled={isNftTransferEnabled} /> },
  ]);
  const resolver = createPageResolver(() => 'wallet-home');
  return { routes, resolver };
}

export const MagicWalletPageRender = () => {
  const globalError = useActiveControlFlowErrorCode();
  const genericErrorPages = useGenericErrorPages(globalError);
  const pages = useMagicWalletPages();
  const payload = useUIThreadPayload();

  const { page, resolvePage } = useController([...pages.routes, ...genericErrorPages.routes], {
    initialPage: payload?.params?.[payload?.params?.length - 1]?.pageId ?? 'wallet-home',
    defaultPage: 'wallet-home',
  });
  resolvePage(genericErrorPages.resolver);

  useEffect(() => {
    const current = payload?.params?.[payload?.params.length - 1];

    if (current?.pageId === 'collectible-details') {
      if (current?.contractAddress && current?.tokenId) {
        globalQueryClient.setQueryData(['collectiable-details-state'], {
          contractAddress: current.contractAddress,
          tokenId: current.tokenId,
        });
      }
    }
  }, []);

  return (
    <connectStore.Provider>
      <nativeMethodsStore.Provider>
        <QueryClientProvider client={globalQueryClient}>
          <Modal.RPC>
            <div id="modal-portal">
              <MultiChainInfo>{page}</MultiChainInfo>
            </div>
          </Modal.RPC>
        </QueryClientProvider>
      </nativeMethodsStore.Provider>
    </connectStore.Provider>
  );
};

const mc_wallet: RpcRouteConfig = {
  // logic rerouted to magic_wallet. see magicRerouteRPC
  middlewares: [atomic(), rejectIfWalletUINotEnabled, hydrateUserOrReject, trackPageMiddleware, showUI.force],
  render: () => <MagicWalletPageRender />,
};

export default createFeatureModule.RPC(mc_wallet);
