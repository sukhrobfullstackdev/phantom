import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createFeatureModule } from '~/features/framework';
import { RpcRouteConfig } from '~/app/rpc/utils/rpc-router';
import { showUI } from '~/app/rpc/controllers/ui.controller';
import { atomic } from '~/app/rpc/controllers/atomic-lock.controller';
import { Modal } from '~/app/ui/components/layout/modal';
import { useActiveControlFlowErrorCode } from '~/app/ui/hooks/ui-thread-hooks';
import { useController } from '~/app/ui/hooks/use-controller';
import { useGenericErrorPages } from '~/app/ui/components/partials/pending-modal/generic-errors';
import { connectStore } from '~/features/connect-with-ui/store';
import { nativeMethodsStore } from '~/features/native-methods/store/native-methods.store';
import { hydrateUserOrReject } from '~/app/rpc/controllers/user.controller';
import { MultiChainInfo } from '~/features/connect-with-ui/hooks/multiChainContext';
import { ChainInfo } from '~/features/connect-with-ui/hooks/chainInfoContext';
import { trackPageMiddleware } from '~/features/connect-with-ui/connect-with-ui.controller';
import { WalletFiatOnRampSelectionPage } from '~/features/blockchain-ui-methods/pages/shared/wallet-fiat-onramp-selection-page';
import { WalletFiatOnRampOnRamper } from '~/features/blockchain-ui-methods/pages/shared/wallet-fiat-onramp-clients/wallet-fiat-onramp-on-ramper';
import { WalletFiatOnrampSardine } from '~/features/blockchain-ui-methods/pages/shared/wallet-fiat-onramp-clients/wallet-fiat-onramp-sardine';
import { WalletFiatOnrampStripe } from '~/features/blockchain-ui-methods/pages/shared/wallet-fiat-onramp-clients/wallet-fiat-onramp-stripe';
import { WalletFiatOnrampSuccessPage } from '~/features/blockchain-ui-methods/pages/shared/wallet-fiat-onramp-success-page';
import { WalletFiatOnrampErrorPage } from '~/features/blockchain-ui-methods/pages/shared/wallet-fiat-onramp-error-page';
import { rejectIfWalletUINotEnabled } from '~/app/rpc/controllers/feature-route.controller';
import { store } from '~/app/store';
import { WalletFiatOnrampPaypal } from '~/features/blockchain-ui-methods/pages/shared/wallet-fiat-onramp-clients/wallet-fiat-onramp-paypal';

export function useShowFiatOnrampPages() {
  const { LAUNCH_DARKLY_FEATURE_FLAGS, CLIENT_FEATURE_FLAGS } = store.hooks.useSelector(state => {
    return state.System;
  });
  const isFiatOnRampEnabled: boolean =
    LAUNCH_DARKLY_FEATURE_FLAGS['is-fiat-on-ramp-enabled'] && CLIENT_FEATURE_FLAGS.is_fiat_onramp_enabled;
  const isFiatOnRampSardineEnabled: boolean = LAUNCH_DARKLY_FEATURE_FLAGS['is-fiat-on-ramp-sardine-enabled'];
  const isFiatOnRampStripeEnabled: boolean = LAUNCH_DARKLY_FEATURE_FLAGS['is-fiat-on-ramp-stripe-enabled'];
  const isFiatOnRampPayPalEnabled: boolean = LAUNCH_DARKLY_FEATURE_FLAGS['is-fiat-on-ramp-paypal-enabled'];

  const { routes, createPageResolver } = useController([
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
    {
      id: 'wallet-fiat-onramp-sardine',
      content: <WalletFiatOnrampSardine isFiatOnRampEnabled={isFiatOnRampEnabled} />,
    },
    { id: 'wallet-fiat-onramp-stripe', content: <WalletFiatOnrampStripe /> },
    { id: 'wallet-fiat-onramp-success', content: <WalletFiatOnrampSuccessPage /> },
    { id: 'wallet-fiat-onramp-error', content: <WalletFiatOnrampErrorPage /> },
  ]);
  const resolver = createPageResolver(() => 'wallet-fiat-onramp-selection');
  return { routes, resolver };
}

export const ShowFiatOnrampPageRender = () => {
  const globalError = useActiveControlFlowErrorCode();
  const genericErrorPages = useGenericErrorPages(globalError);
  const pages = useShowFiatOnrampPages();
  const queryClient = new QueryClient();
  const { page, resolvePage } = useController([...pages.routes, ...genericErrorPages.routes]);
  resolvePage(genericErrorPages.resolver);

  return (
    <connectStore.Provider>
      <nativeMethodsStore.Provider>
        <QueryClientProvider client={queryClient}>
          <Modal.RPC>
            <div id="modal-portal">
              <ChainInfo>
                <MultiChainInfo>{page}</MultiChainInfo>
              </ChainInfo>
            </div>
          </Modal.RPC>
        </QueryClientProvider>
      </nativeMethodsStore.Provider>
    </connectStore.Provider>
  );
};

const magic_show_fiat_onramp: RpcRouteConfig = {
  middlewares: [atomic(), rejectIfWalletUINotEnabled, hydrateUserOrReject, trackPageMiddleware, showUI.force],
  render: () => <ShowFiatOnrampPageRender />,
};

export default createFeatureModule.RPC(magic_show_fiat_onramp);
