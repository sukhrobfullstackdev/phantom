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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SendGaslessTransactionErrorPage } from './pages/send-gasless-transaction-error-page/send-gasless-transaction-error-page';
import { compareSignerUserAddress } from '../../blockchain-ui-methods.controller';
import { SendGaslessTransactionPage } from './pages/send-gasless-transaction-page/send-gasless-transaction-page';

function useSendGaslessTransactionPages() {
  const { routes, createPageResolver } = useController([
    {
      id: 'eth-send-gasless-transaction',
      content: <SendGaslessTransactionPage />,
    },
    {
      id: 'eth-send-gasless-transaction-error',
      content: <SendGaslessTransactionErrorPage />,
    },
  ]);
  const resolver = createPageResolver(() => 'eth-send-gasless-transaction');
  return { routes, resolver };
}

const queryClient = new QueryClient();

const Root = () => {
  const globalError = useActiveControlFlowErrorCode();
  const genericErrorPages = useGenericErrorPages(globalError);
  const { routes } = useSendGaslessTransactionPages();

  const { page, resolvePage } = useController([...routes, ...genericErrorPages.routes]);
  resolvePage(genericErrorPages.resolver);

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

const mwui_eth_sendGaslessTransaction: RpcRouteConfig = {
  middlewares: [
    atomic(),
    redirectThirdPartyWallet,
    hydrateUserOrReject,
    compareSignerUserAddress,
    trackPageMiddleware,
    showUI.force,
  ],
  render: () => <Root />,
};

export default createFeatureModule.RPC(mwui_eth_sendGaslessTransaction);
