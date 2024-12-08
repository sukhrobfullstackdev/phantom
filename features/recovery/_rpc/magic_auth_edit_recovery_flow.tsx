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
import { RemovePhoneNumberPage } from '~/features/recovery/components/remove-phone-number-page/remove-phone-number-page';
import { useRecencyCheckPages } from '~/features/recency-check/use-recency-check-pages';

export function useEditRecoveryFlow(
  options: { returnToRoute: any } = {
    returnToRoute: undefined,
  },
) {
  const { routes, createPageResolver } = createRoutes([
    { id: 'edit-phone-number', content: <RecoveryPhoneNumberPage navBackRoute="auth-settings" flow="edit" /> },
    {
      id: 'edit-sms-recovery-verification',
      content: <RecoverySmsVerificationPage navBackRoute="edit-phone-number" flow="edit" />,
    },
    { id: 'phone-number-edited', content: <PhoneNumberAddedPage {...options} flow="edit" /> },
    { id: 'contact-support', content: <ContactSupportPage /> },
    { id: 'remove-phone-number', content: <RemovePhoneNumberPage navBackRoute="edit-phone-number" /> },
  ]);
  const resolver = createPageResolver(() => 'edit-phone-number');
  return { routes, resolver };
}

const PageRender = () => {
  const globalError = useActiveControlFlowErrorCode();
  const genericErrorPages = useGenericErrorPages(globalError);
  const recoveryFlow = useEditRecoveryFlow();
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

const magic_auth_edit_recovery_flow: RpcRouteConfig = {
  middlewares: [atomic(), hydrateUserOrReject, showUI.force],
  render: () => (
    <recoveryStore.Provider>
      <PageRender />
    </recoveryStore.Provider>
  ),
};

export default createFeatureModule.RPC(magic_auth_edit_recovery_flow);
