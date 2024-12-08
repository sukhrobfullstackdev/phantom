import React from 'react';
import { createFeatureModule } from '~/features/framework';
import { RpcRouteConfig } from '~/app/rpc/utils/rpc-router';
import { showUI } from '~/app/rpc/controllers/ui.controller';
import { atomic } from '~/app/rpc/controllers/atomic-lock.controller';
import { hydrateUserOrReject } from '~/app/rpc/controllers/user.controller';
import { Modal } from '~/app/ui/components/layout/modal';
import { useActiveControlFlowErrorCode } from '~/app/ui/hooks/ui-thread-hooks';
import { createRoutes, useController } from '~/app/ui/hooks/use-controller';
import { useGenericErrorPages } from '~/app/ui/components/partials/pending-modal/generic-errors';
import { RecoveryPhoneNumberPage } from '../components/recovery-phone-number-page';
import { RecoverySmsVerificationPage } from '../components/setup-recovery-sms-verification-page';
import { PhoneNumberAddedPage } from '~/features/recovery/components/phone-number-added-page';
import { recoveryStore } from '~/features/recovery/store';
import { ContactSupportPage } from '~/features/recovery/components/contact-support-page';
import { useRecencyCheckPages } from '~/features/recency-check/use-recency-check-pages';

export function useSetupRecoveryFlow(
  options: { returnToRoute: any } = {
    returnToRoute: undefined,
  },
) {
  const { routes, createPageResolver } = createRoutes([
    { id: 'add-phone-number', content: <RecoveryPhoneNumberPage navBackRoute="auth-settings" flow="setup" /> },
    {
      id: 'add-sms-recovery-verification',
      content: <RecoverySmsVerificationPage navBackRoute="add-phone-number" flow="setup" />,
    },
    { id: 'phone-number-added', content: <PhoneNumberAddedPage {...options} flow="setup" /> },
    { id: 'contact-support', content: <ContactSupportPage /> },
  ]);
  const resolver = createPageResolver(() => 'add-phone-number');
  return { routes, resolver };
}

const PageRender = () => {
  const globalError = useActiveControlFlowErrorCode();
  const genericErrorPages = useGenericErrorPages(globalError);
  const recoveryFlow = useSetupRecoveryFlow();
  const recencyCheckPages = useRecencyCheckPages();

  const { page, resolvePage } = useController([
    ...recencyCheckPages.routes,
    ...recoveryFlow.routes,
    ...genericErrorPages.routes,
  ]);
  resolvePage(genericErrorPages.resolver);
  return (
    <Modal.RPC>
      <div id="modal-portal">{page}</div>
    </Modal.RPC>
  );
};

const magic_auth_setup_recovery_flow: RpcRouteConfig = {
  middlewares: [atomic(), hydrateUserOrReject, showUI.force],
  render: () => (
    <recoveryStore.Provider>
      <PageRender />
    </recoveryStore.Provider>
  ),
};

export default createFeatureModule.RPC(magic_auth_setup_recovery_flow);
