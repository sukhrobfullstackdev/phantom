import React from 'react';
import { createFeatureModule } from '~/features/framework';
import { RpcRouteConfig } from '~/app/rpc/utils/rpc-router';
import { showUI } from '~/app/rpc/controllers/ui.controller';
import { hydrateUserOrReject } from '~/app/rpc/controllers/user.controller';
import { atomic } from '~/app/rpc/controllers/atomic-lock.controller';
import { Modal } from '~/app/ui/components/layout/modal';
import { useController } from '~/app/ui/hooks/use-controller';
import { useActiveControlFlowErrorCode } from '~/app/ui/hooks/ui-thread-hooks';
import { useGenericErrorPages } from '~/app/ui/components/partials/pending-modal/generic-errors';
import { ifGlobalAppScopeRejectMagicRPC } from '~/app/rpc/controllers/feature-route.controller';
import { updatePhoneNumberStore } from '../store';
import { InputNewPhoneNumber } from '../components/input-new-phone-number';
import { UpdatePhoneNumberSmsVerificationPage } from '../components/update-phone-number-sms-verification-page';
import { marshallUpdatePhoneNumberParams } from '../update-phone-number.controller';

/**
 * Define phone number update flow pages & route reducer.
 */
export function useUpdatePhoneNumberPages() {
  const { routes, createPageResolver } = useController([
    { id: 'input-new-phone-number', content: <InputNewPhoneNumber /> },
    {
      id: 'update-phone-number-verification',
      content: <UpdatePhoneNumberSmsVerificationPage navBackRoute="input-new-phone-number" />,
    },
  ]);
  const resolver = createPageResolver(() => 'input-new-phone-number');
  return { routes, resolver };
}

const PageRender = () => {
  const globalError = useActiveControlFlowErrorCode();
  const genericErrorPages = useGenericErrorPages(globalError);
  const updatePhoneNumberPages = useUpdatePhoneNumberPages();

  // Compose all routes in order of precedence.
  const { page, resolvePage } = useController([...updatePhoneNumberPages.routes, ...genericErrorPages.routes]);
  resolvePage(genericErrorPages.resolver);

  return (
    <Modal.RPC>
      <div id="modal-portal">{page}</div>
    </Modal.RPC>
  );
};

const magic_auth_update_phone_number: RpcRouteConfig = {
  middlewares: [
    atomic(),
    ifGlobalAppScopeRejectMagicRPC,
    marshallUpdatePhoneNumberParams,
    hydrateUserOrReject,
    showUI.force,
  ],
  render: () => (
    <updatePhoneNumberStore.Provider>
      <PageRender />
    </updatePhoneNumberStore.Provider>
  ),
};

export default createFeatureModule.RPC(magic_auth_update_phone_number);
