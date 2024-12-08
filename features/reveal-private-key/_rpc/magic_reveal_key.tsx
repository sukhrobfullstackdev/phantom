import React from 'react';
import { createFeatureModule } from '~/features/framework';
import { showUI } from '~/app/rpc/controllers/ui.controller';
import { atomic } from '~/app/rpc/controllers/atomic-lock.controller';
import { ifGlobalAppScopeRejectMagicRPC } from '~/app/rpc/controllers/feature-route.controller';
import { useGenericErrorPages } from '~/app/ui/components/partials/pending-modal/generic-errors';
import { Modal } from '~/app/ui/components/layout/modal';
import { useController } from '~/app/ui/hooks/use-controller';
import { useActiveControlFlowErrorCode, useUIThreadPayload } from '~/app/ui/hooks/ui-thread-hooks';
import { AgreementViewModal } from '../components/agreement-view-modal';
import { RevealPrivateKeyModal } from '../components/reveal-private-key-modal';
import { hydrateUserOrReject } from '~/app/rpc/controllers/user.controller';
import { MwsLogoutModal } from '../components/mws-logout-modal';
import styles from '../styles/index.less';

export function useRevealPrivateKeyPages() {
  const { routes, createPageResolver } = useController([
    { id: 'agreement-view-modal', content: <AgreementViewModal /> },
    { id: 'reveal-private-key-modal', content: <RevealPrivateKeyModal /> },
    { id: 'mws-logout-modal', content: <MwsLogoutModal /> },
  ]);
  const resolver = createPageResolver(() => 'agreement-view-modal');

  return { routes, resolver };
}

export default createFeatureModule.RPC({
  middlewares: [atomic(), ifGlobalAppScopeRejectMagicRPC, hydrateUserOrReject, showUI.force],

  render: () => {
    const globalError = useActiveControlFlowErrorCode();
    const genericErrorPages = useGenericErrorPages(globalError);
    const revealPrivateKeyPages = useRevealPrivateKeyPages();
    const payload = useUIThreadPayload();
    const showBackground = !!payload?.params[0]?.isLegacyFlow;

    const { page, resolvePage } = useController([...revealPrivateKeyPages.routes, ...genericErrorPages.routes]);
    resolvePage(genericErrorPages.resolver);

    return (
      // Adds background for legacy reveal flow
      <div className={showBackground ? styles.background : ''}>
        <Modal.RPC>
          <div id="modal-portal">{page}</div>
        </Modal.RPC>
      </div>
    );
  },
});
