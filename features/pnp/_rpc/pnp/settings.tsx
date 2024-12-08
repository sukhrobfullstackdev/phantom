import React from 'react';
import { createFeatureModule } from '~/features/framework';
import { RpcRouteConfig } from '~/app/rpc/utils/rpc-router';
import { showUI } from '~/app/rpc/controllers/ui.controller';
import { atomic } from '~/app/rpc/controllers/atomic-lock.controller';
import { hydrateUserOrReject } from '~/app/rpc/controllers/user.controller';
import { Modal } from '~/app/ui/components/layout/modal';
import { useController } from '~/app/ui/hooks/use-controller';
import { useGenericErrorPages } from '~/app/ui/components/partials/pending-modal/generic-errors';
import { marshalSettingsParams } from '~/features/settings/settings-controller';
import { useAuthSettingsPages } from '~/features/settings/use-auth-settings-pages';
import { pnpStore } from '../../store';

const magic_auth_settings: RpcRouteConfig = {
  middlewares: [atomic(), marshalSettingsParams, hydrateUserOrReject, showUI.force],

  render: () => {
    const authSettingsPages = useAuthSettingsPages();
    const genericErrorPages = useGenericErrorPages();

    const { page } = useController([...authSettingsPages.routes, ...genericErrorPages.routes], {
      resolvers: [genericErrorPages.resolver],
    });

    return (
      <pnpStore.Provider>
        <Modal.RPC obfuscateBackground={false}>
          <div id="modal-portal">{page}</div>
        </Modal.RPC>
      </pnpStore.Provider>
    );
  },
};

export default createFeatureModule.RPC(magic_auth_settings);
