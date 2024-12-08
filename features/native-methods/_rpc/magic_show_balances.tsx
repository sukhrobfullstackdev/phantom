import React, { useContext } from 'react';
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
import { MultiChainInfo, MultiChainInfoContext } from '~/features/connect-with-ui/hooks/multiChainContext';
import { ChainInfo } from '~/features/connect-with-ui/hooks/chainInfoContext';
import { trackPageMiddleware } from '~/features/connect-with-ui/connect-with-ui.controller';
import { rejectIfWalletUINotEnabled } from '~/app/rpc/controllers/feature-route.controller';
import { TokenList } from '~/features/connect-with-ui/components/token-list';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { Network } from '~/features/connect-with-ui/components/network';
import { useGetNativeTokenBalance } from '~/features/connect-with-ui/hooks/useGetNativeTokenBalance';
import { Spacer } from '@magiclabs/ui';
import { FaucetBanner } from '~/features/connect-with-ui/components/faucet-banner';
import { BalanceInUsd } from '~/features/connect-with-ui/components/balance-in-usd';
import { WalletAddress } from '../pages/wallet-account-info-page';

const TokenListPage = () => {
  const chainInfo = useContext(MultiChainInfoContext);
  const balance = useGetNativeTokenBalance();
  return (
    <div>
      <ModalHeader rightAction={<CancelActionButton />} header={<Network />} />
      {!chainInfo?.isMainnet && balance === '0x0' ? (
        <>
          <Spacer size={16} orientation="vertical" />
          <FaucetBanner />
        </>
      ) : null}
      <div style={{ overflow: 'auto', maxHeight: '680px', textAlign: 'center' }}>
        <Spacer size={24} orientation="vertical" />
        <BalanceInUsd />
        <Spacer size={4} orientation="vertical" />
        <WalletAddress />
        <Spacer size={28} orientation="vertical" />
        <TokenList />
      </div>
    </div>
  );
};

export function useShowTokenBalancesPages() {
  const { routes, createPageResolver } = useController([
    {
      id: 'wallet-token-balances',
      content: <TokenListPage />,
    },
  ]);
  const resolver = createPageResolver(() => 'wallet-token-balances');
  return { routes, resolver };
}

export const ShowTokenBalancesPageRender = () => {
  const globalError = useActiveControlFlowErrorCode();
  const genericErrorPages = useGenericErrorPages(globalError);
  const pages = useShowTokenBalancesPages();
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

const magic_show_balances: RpcRouteConfig = {
  middlewares: [atomic(), rejectIfWalletUINotEnabled, hydrateUserOrReject, trackPageMiddleware, showUI.force],
  render: () => <ShowTokenBalancesPageRender />,
};

export default createFeatureModule.RPC(magic_show_balances);
