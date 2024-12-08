import React from 'react';
import { createFeatureModule } from '~/features/framework';
import { showUI } from '~/app/rpc/controllers/ui.controller';
import { atomic } from '~/app/rpc/controllers/atomic-lock.controller';
import { ifGlobalAppScopeRejectMagicRPC } from '~/app/rpc/controllers/feature-route.controller';
import { useGenericErrorPages } from '~/app/ui/components/partials/pending-modal/generic-errors';
import { Modal } from '~/app/ui/components/layout/modal';
import { useController } from '~/app/ui/hooks/use-controller';
import { useActiveControlFlowErrorCode } from '~/app/ui/hooks/ui-thread-hooks';
import { hydrateUserOrReject } from '~/app/rpc/controllers/user.controller';
import styles from '../styles/index.less';
import { RpcMiddleware } from '~/app/rpc/types';
import { rejectPayload } from '~/app/rpc/utils';
import { sdkErrorFactories } from '~/app/libs/exceptions';
import { store } from '~/app/store';
import { RevealWalletCredentialsModal } from '../components/wc-reveal-wallet-credentials-modal';
import { CredentialType } from '~/app/store/user/user.thunks';

const checkIfCanToRevealWalletCredentials: RpcMiddleware = ({ payload }, next) => {
  const { LAUNCH_DARKLY_FEATURE_FLAGS } = store.getState().System;

  const canRevealWalletCredentials = LAUNCH_DARKLY_FEATURE_FLAGS['is-reveal-seed-phrase-allowed'];
  if (!canRevealWalletCredentials) {
    rejectPayload(payload, sdkErrorFactories.magic.unsupportedSDKMethodGeneric());
  } else {
    next();
  }
};

export function useRevealWalletCredentialsPages() {
  const payload = store.hooks.useSelector(state => state.UIThread.payload);

  const credentialType =
    payload?.params[0]?.credentialType === 'private_key' ? CredentialType.PrivateKey : CredentialType.SeedPhrase;

  const { routes, createPageResolver } = useController([
    {
      id: 'reveal-wallet-credentials-modal',
      content: <RevealWalletCredentialsModal credentialType={credentialType} />,
    },
  ]);
  const resolver = createPageResolver(() => 'reveal-wallet-credentials-modal');

  return { routes, resolver };
}

export default createFeatureModule.RPC({
  middlewares: [
    atomic(),
    ifGlobalAppScopeRejectMagicRPC,
    checkIfCanToRevealWalletCredentials,
    hydrateUserOrReject,
    showUI.force,
  ],

  render: () => {
    const globalError = useActiveControlFlowErrorCode();
    const genericErrorPages = useGenericErrorPages(globalError);
    const revealWalletCredentialsPages = useRevealWalletCredentialsPages();

    const { page, resolvePage } = useController([...revealWalletCredentialsPages.routes, ...genericErrorPages.routes]);
    resolvePage(genericErrorPages.resolver);

    return (
      <div className={styles.background}>
        <Modal.RPC>
          <div id="modal-portal">{page}</div>
        </Modal.RPC>
      </div>
    );
  },
});
