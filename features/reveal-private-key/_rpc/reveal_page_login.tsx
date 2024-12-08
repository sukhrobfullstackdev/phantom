import React from 'react';
import { createFeatureModule } from '~/features/framework';
import { showUI } from '~/app/rpc/controllers/ui.controller';
import { atomic } from '~/app/rpc/controllers/atomic-lock.controller';
import { ifGlobalAppScopeRejectMagicRPC } from '~/app/rpc/controllers/feature-route.controller';
import { useGenericErrorPages } from '~/app/ui/components/partials/pending-modal/generic-errors';
import { Modal } from '~/app/ui/components/layout/modal';
import { useController } from '~/app/ui/hooks/use-controller';
import { LoginFormModal } from '../components/login-form-modal';
import { useActiveControlFlowErrorCode } from '~/app/ui/hooks/ui-thread-hooks';
import { resolvePublicAddressIfLoggedIn } from '~/features/connect-with-ui/connect-with-ui.controller';
import styles from '../styles/index.less';
import { revealStore } from '../store';

export function useLoginFormPages() {
  const { routes, createPageResolver } = useController([{ id: 'reveal-page-login', content: <LoginFormModal /> }]);
  const resolver = createPageResolver(() => 'reveal-page-login');

  return { routes, resolver };
}

export default createFeatureModule.RPC({
  middlewares: [atomic(), ifGlobalAppScopeRejectMagicRPC, resolvePublicAddressIfLoggedIn, showUI.force],

  render: () => {
    const globalError = useActiveControlFlowErrorCode();
    const genericErrorPages = useGenericErrorPages(globalError);
    const loginFormPages = useLoginFormPages();

    const { page, resolvePage } = useController([...loginFormPages.routes, ...genericErrorPages.routes]);
    resolvePage(genericErrorPages.resolver);

    return (
      <revealStore.Provider>
        <div className={styles.background}>
          <Modal.RPC>
            <div id="modal-portal">{page}</div>
          </Modal.RPC>
        </div>
      </revealStore.Provider>
    );
  },
});
