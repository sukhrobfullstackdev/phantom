import React from 'react';
import { createFeatureModule } from '~/features/framework';
import { RpcRouteConfig } from '~/app/rpc/utils/rpc-router';
import { showUI } from '~/app/rpc/controllers/ui.controller';
import { atomic } from '~/app/rpc/controllers/atomic-lock.controller';
import { Modal } from '~/app/ui/components/layout/modal';
import { marshallRecoverAccountParams } from '../recovery-controller';
import { useActiveControlFlowErrorCode } from '~/app/ui/hooks/ui-thread-hooks';
import { createRoutes, useController } from '~/app/ui/hooks/use-controller';
import { useGenericErrorPages } from '~/app/ui/components/partials/pending-modal/generic-errors';
import { recoveryStore } from '~/features/recovery/store';
import { UseRecoverySmsVerificationPage } from '~/features/recovery/components/use-recovery-sms-verification-page';
import { ifGlobalAppScopeRejectMagicRPC } from '~/app/rpc/controllers/feature-route.controller';
import { AccountRecoveredPage } from '~/features/recovery/components/account-recovered-page';
import { ContactSupportPage } from '~/features/recovery/components/contact-support-page';
import { useUpdateEmailV2Pages } from '~/features/update-email/_rpc/magic_auth_update_email_v2';

export function useRecoverAccountFlow() {
  const { routes, createPageResolver } = createRoutes([
    { id: 'use-sms-recovery-verification', content: <UseRecoverySmsVerificationPage /> },
    { id: 'account-recovered', content: <AccountRecoveredPage /> },
    { id: 'contact-support', content: <ContactSupportPage /> },
  ]);
  const resolver = createPageResolver(() => 'use-sms-recovery-verification');
  return { routes, resolver };
}

const PageRender = () => {
  const globalError = useActiveControlFlowErrorCode();
  const genericErrorPages = useGenericErrorPages(globalError);
  const useRecoverAccountPages = useRecoverAccountFlow();
  const updateEmailV2Pages = useUpdateEmailV2Pages();

  const { page, resolvePage } = useController([
    ...useRecoverAccountPages.routes,
    ...updateEmailV2Pages.routes,
    ...genericErrorPages.routes,
  ]);
  resolvePage(genericErrorPages.resolver);
  return (
    <Modal.RPC>
      <div id="modal-portal">{page}</div>
    </Modal.RPC>
  );
};

const magic_auth_recover_account: RpcRouteConfig = {
  middlewares: [atomic(), ifGlobalAppScopeRejectMagicRPC, marshallRecoverAccountParams, showUI.force],
  render: () => (
    <recoveryStore.Provider>
      <PageRender />
    </recoveryStore.Provider>
  ),
};

export default createFeatureModule.RPC(magic_auth_recover_account);
