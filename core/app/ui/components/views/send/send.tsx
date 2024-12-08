import React from 'react';
import { UIThreadActionsProvider } from '~/app/ui/hooks/ui-thread-hooks';
import { PendingModal } from '../../partials/pending-modal';

export const Send: React.FC = () => {
  return (
    <UIThreadActionsProvider>
      <PendingModal />
    </UIThreadActionsProvider>
  );
};
