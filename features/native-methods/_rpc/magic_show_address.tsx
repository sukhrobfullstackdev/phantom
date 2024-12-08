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
import { WalletReceiveFundsPage } from '../pages/wallet-receive-funds-page';
import { rejectIfWalletUINotEnabled } from '~/app/rpc/controllers/feature-route.controller';

export function useShowWalletAddressPages() {
  const { routes, createPageResolver } = useController([
    { id: 'wallet-receive-funds', content: <WalletReceiveFundsPage /> },
  ]);
  const resolver = createPageResolver(() => 'wallet-receive-funds');
  return { routes, resolver };
}

export const ShowAddressPageRender = () => {
  const globalError = useActiveControlFlowErrorCode();
  const genericErrorPages = useGenericErrorPages(globalError);
  const pages = useShowWalletAddressPages();
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

const magic_show_address: RpcRouteConfig = {
  middlewares: [atomic(), rejectIfWalletUINotEnabled, hydrateUserOrReject, trackPageMiddleware, showUI.force],
  render: () => <ShowAddressPageRender />,
};

export default createFeatureModule.RPC(magic_show_address);
