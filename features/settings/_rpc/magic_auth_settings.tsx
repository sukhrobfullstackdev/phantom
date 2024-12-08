import React from 'react';
import { createFeatureModule } from '~/features/framework';
import { showUI } from '~/app/rpc/controllers/ui.controller';
import { atomic } from '~/app/rpc/controllers/atomic-lock.controller';
import { hydrateUserOrReject } from '~/app/rpc/controllers/user.controller';
import { Modal } from '~/app/ui/components/layout/modal';
import { useController } from '~/app/ui/hooks/use-controller';
import { useGenericErrorPages } from '~/app/ui/components/partials/pending-modal/generic-errors';
import { marshalSettingsParams } from '../settings-controller';
import { useAuthSettingsPages } from '../use-auth-settings-pages';
import { ifGlobalAppScopeRejectMagicRPC } from '~/app/rpc/controllers/feature-route.controller';

export default createFeatureModule.RPC({
  middlewares: [atomic(), ifGlobalAppScopeRejectMagicRPC, hydrateUserOrReject, marshalSettingsParams, showUI.force],

  render: () => {
    const authSettingsPages = useAuthSettingsPages();
    const genericErrorPages = useGenericErrorPages();

    const { page, createPageResolver } = useController([...authSettingsPages.routes, ...genericErrorPages.routes]);
    createPageResolver(genericErrorPages.resolver, authSettingsPages.resolver);

    return (
      <Modal.RPC>
        <div id="modal-portal">{page}</div>
      </Modal.RPC>
    );
  },
});
