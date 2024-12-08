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
import { PromptAuthenticatorPage } from '../components/prompt-authenticator-page';
import { EnrollCodePage } from '../components/enroll-code-page';
import { EnterTotpPage } from '../components/enter-totp-page';
import { RecoveryCodePage } from '../components/recovery-code-page';

export function useEnableMfaPages(
  options: { returnToRoute: any } = {
    returnToRoute: undefined,
  },
) {
  const { routes, createPageResolver } = useController([
    { id: 'mfa-prompt-authenticator', content: <PromptAuthenticatorPage {...options} /> },
    {
      id: 'mfa-enroll-code',
      content: <EnrollCodePage {...options} />,
    },
    {
      id: 'mfa-enter-totp',
      content: <EnterTotpPage {...options} />,
    },
    { id: 'mfa-recovery-codes', content: <RecoveryCodePage {...options} /> },
  ]);
  const resolver = createPageResolver(() => 'mfa-prompt-authenticator');
  return { routes, resolver };
}

const pageRender = () => {
  const globalError = useActiveControlFlowErrorCode();
  const genericErrorPages = useGenericErrorPages(globalError);
  const enableMfaPages = useEnableMfaPages();

  const { page, resolvePage } = useController([...enableMfaPages.routes, ...genericErrorPages.routes]);
  resolvePage(genericErrorPages.resolver);
  return (
    <Modal.RPC>
      <div id="modal-portal">{page}</div>
    </Modal.RPC>
  );
};

const magic_auth_enable_mfa_flow: RpcRouteConfig = {
  middlewares: [atomic(), marshalMfaParams, hydrateUserOrReject, showUI.force],
  render: pageRender,
};

export default createFeatureModule.RPC(magic_auth_enable_mfa_flow);
