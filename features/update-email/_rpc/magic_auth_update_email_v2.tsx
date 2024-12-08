import React from 'react';
import { createFeatureModule } from '~/features/framework';
import { RpcRouteConfig } from '~/app/rpc/utils/rpc-router';
import { showUI } from '~/app/rpc/controllers/ui.controller';
import { hydrateUserOrReject } from '~/app/rpc/controllers/user.controller';
import { atomic } from '~/app/rpc/controllers/atomic-lock.controller';
import { Modal } from '~/app/ui/components/layout/modal';

import { createRoutes, useController } from '~/app/ui/hooks/use-controller';
import { useActiveControlFlowErrorCode } from '~/app/ui/hooks/ui-thread-hooks';
import { useGenericErrorPages } from '~/app/ui/components/partials/pending-modal/generic-errors';
import { ifGlobalAppScopeRejectMagicRPC } from '~/app/rpc/controllers/feature-route.controller';
import { InputNewEmailAddress } from '~/features/update-email/components/update-email-v2/input-new-email-address';
import { UpdateEmailOtpVerificationPage } from '~/features/update-email/components/update-email-v2/update-email-address-verification';
import { UpdateEmailSuccessful } from '~/features/update-email/components/update-email-v2/update-email-successful';
import { marshallUpdateEmailParamsV2 } from '../update-email.controller';
import { useRecencyCheckPages } from '~/features/recency-check/use-recency-check-pages';
import { applyUpdateEmailWhitelabel } from '~/features/update-email/update-email-whitelabel.controller';
import { recencyCheck } from '~/features/recency-check/recency-check.controller';

/**
 * Define email update flow pages & route reducer.
 */

interface Options {
  returnToRoute: string | undefined;
}

export function useUpdateEmailV2Pages(
  options: Options = {
    returnToRoute: undefined,
  },
) {
  const { routes, createPageResolver } = createRoutes([
    { id: 'update-email-input-address', content: <InputNewEmailAddress {...options} /> },
    {
      id: 'update-email-otp-verification',
      content: <UpdateEmailOtpVerificationPage />,
    },
    { id: 'update-email-successful', content: <UpdateEmailSuccessful /> },
  ]);

  const resolver = createPageResolver(() => 'update-email-input-address');

  return { routes, resolver };
}

const pageRender = () => {
  const globalError = useActiveControlFlowErrorCode();
  const genericErrorPages = useGenericErrorPages(globalError);
  const updateEmailPages = useUpdateEmailV2Pages();
  const recencyCheckPages = useRecencyCheckPages();
  // Compose all routes in order of precedence.
  const { page, resolvePage } = useController([
    ...recencyCheckPages.routes,
    ...updateEmailPages.routes,
    ...genericErrorPages.routes,
  ]);
  resolvePage(genericErrorPages.resolver);

  return (
    <Modal.RPC>
      <div id="modal-portal">{page}</div>
    </Modal.RPC>
  );
};

const magic_auth_update_email_v2: RpcRouteConfig = {
  middlewares: [
    atomic(),
    ifGlobalAppScopeRejectMagicRPC,
    marshallUpdateEmailParamsV2,
    hydrateUserOrReject,
    recencyCheck,
    applyUpdateEmailWhitelabel,
    showUI.force,
  ],
  render: pageRender,
};

export default createFeatureModule.RPC(magic_auth_update_email_v2);
