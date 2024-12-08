import React, { Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Modal } from '~/app/ui/components/layout/modal';
import { StandardPage } from '~/app/ui/components/layout/standard-page';
import { useController } from '~/app/ui/hooks/use-controller';
import { createFeatureModule } from '~/features/framework';
import { ConfirmNFTTransferPage } from './pages/confirm-nft-transfer-page';
import { NFTTransferExpiredPage } from './pages/nft-transfer-expired-page';
import { NFTTransferErrorPage } from './pages/nft-transfer-error-page';
import { NFTTransferCanceledPage } from './pages/nft-transfer-canceled-page';
import { NFTTransferLoadingPage } from './pages/nft-transfer-loading-page';
import { NFTTransferConfirmedPage } from './pages/nft-transfer-confirmed-page';
import { MultiChainProvider } from './components/multi-chain-provider';
import { NFTTransferInvalidParamsPage } from './pages/nft-transfer-invalid-params';
import { NFTTransferNotSupportedPage } from './pages/nft-transfer-not-supported-page';
import { MotionLoading } from '../../components/motion-loading/motion-loading';
import { ErrorBoundary } from '~/app/libs/exceptions/error-boundary';

function useConfirmNFTTransfer() {
  const { routes } = useController([
    {
      id: 'nft-transfer-loading',
      content: <NFTTransferLoadingPage />,
    },
    {
      id: 'confirm-nft-transfer',
      content: <ConfirmNFTTransferPage />,
    },
    {
      id: 'nft-transfer-confirmed',
      content: <NFTTransferConfirmedPage />,
    },
    {
      id: 'nft-transfer-expired',
      content: <NFTTransferExpiredPage />,
    },
    {
      id: 'nft-transfer-canceled',
      content: <NFTTransferCanceledPage />,
    },
    {
      id: 'nft-transfer-invalid-params',
      content: <NFTTransferInvalidParamsPage />,
    },
    {
      id: 'nft-transfer-not-supported',
      content: <NFTTransferNotSupportedPage />,
    },
    {
      id: 'nft-transfer-error',
      content: <NFTTransferErrorPage />,
    },
  ]);

  return { routes };
}

const queryClient = new QueryClient();

const render = () => {
  const { routes } = useConfirmNFTTransfer();
  const { page } = useController(routes);

  return (
    <QueryClientProvider client={queryClient}>
      <StandardPage>
        <Modal in>
          <MultiChainProvider>
            <div id="modal-portal">
              <ErrorBoundary fallback={<NFTTransferErrorPage />}>
                <Suspense fallback={<MotionLoading key="confirm-nft-transfer-loading" />}>{page}</Suspense>
              </ErrorBoundary>
            </div>
          </MultiChainProvider>
        </Modal>
      </StandardPage>
    </QueryClientProvider>
  );
};

export default createFeatureModule.Page({
  render,
});
