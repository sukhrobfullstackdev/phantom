import React from 'react';
import { createFeatureModule } from '~/features/framework';
import { RpcRouteConfig } from '~/app/rpc/utils/rpc-router';
import { showUI } from '~/app/rpc/controllers/ui.controller';
import { atomic } from '~/app/rpc/controllers/atomic-lock.controller';
import { hydrateUserOrReject } from '~/app/rpc/controllers/user.controller';
import { Modal } from '~/app/ui/components/layout/modal';
import { marshalMfaParams } from '../mfa-controller';
import { useActiveControlFlowErrorCode } from '~/app/ui/hooks/ui-thread-hooks';
import { useController } from '~/app/ui/hooks/use-controller';
import { useGenericErrorPages } from '~/app/ui/components/partials/pending-modal/generic-errors';
import { DisableTotpPage } from '../components/enter-totp-page';
import { EnterRecoveryCodePage, LockoutRecoveryCodePage, LostRecoveryCodePage } from '../components/recovery-code-page';
import { useDisableMfa } from '../hooks/mfaHooks';

export function useDisableMfaPages(
  options: { returnToRoute: any } = {
    returnToRoute: undefined,
  },
) {
  const { isLoading, error, disableTotpRecoveryCode } = useDisableMfa();
  const { routes, createPageResolver } = useController([
    { id: 'mfa-disable-totp', content: <DisableTotpPage {...options} /> },
    {
      id: 'enter-recovery-code',
      content: (
        <EnterRecoveryCodePage
          tryRecovery={disableTotpRecoveryCode}
          isLoading={isLoading}
          error={error}
          recoverySuccessRoute={options.returnToRoute}
          navBackRoute="mfa-disable-totp"
        />
      ),
    },
    {
      id: 'lost-recovery-code',
      content: <LostRecoveryCodePage navBackRoute="enter-recovery-code" />,
    },
    {
      id: 'recovery-code-lockout',
      content: <LockoutRecoveryCodePage lockoutExitRoute={options.returnToRoute} />,
    },
  ]);
  const resolver = createPageResolver(() => 'mfa-disable-totp');
  return { routes, resolver };
}

const pageRender = () => {
  const globalError = useActiveControlFlowErrorCode();
  const genericErrorPages = useGenericErrorPages(globalError);
  const disableMfaPages = useDisableMfaPages();

  const { page, resolvePage } = useController([...disableMfaPages.routes, ...genericErrorPages.routes]);
  resolvePage(genericErrorPages.resolver);
  return (
    <Modal.RPC>
      <div id="modal-portal">{page}</div>
    </Modal.RPC>
  );
};

const magic_auth_disable_mfa_flow: RpcRouteConfig = {
  middlewares: [atomic(), marshalMfaParams, hydrateUserOrReject, showUI.force],
  render: pageRender,
};

export default createFeatureModule.RPC(magic_auth_disable_mfa_flow);
