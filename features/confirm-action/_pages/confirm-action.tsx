import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { ConfirmActionPage } from '~/features/confirm-action/components/confirm-action-page';
import { createFeatureModule } from '~/features/framework';
import { MultiChainProvider } from '~/features/native-methods/pages/confirm-nft-transfer/components/multi-chain-provider';

const render = () => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <MultiChainProvider>
        <ConfirmActionPage />
      </MultiChainProvider>
    </QueryClientProvider>
  );
};

export default createFeatureModule.Page({
  render,
});
