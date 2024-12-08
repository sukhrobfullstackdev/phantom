import React from 'react';
import { atomic } from '~/app/rpc/controllers/atomic-lock.controller';
import { rejectIfWalletUINotEnabled } from '~/app/rpc/controllers/feature-route.controller';
import { showUI } from '~/app/rpc/controllers/ui.controller';
import { hydrateUserOrReject } from '~/app/rpc/controllers/user.controller';
import { RpcRouteConfig } from '~/app/rpc/utils/rpc-router';
import { trackPageMiddleware } from '~/features/connect-with-ui/connect-with-ui.controller';
import { createFeatureModule } from '~/features/framework';
import { MagicWalletPageRender } from './mc_wallet';

const magic_wallet: RpcRouteConfig = {
  middlewares: [atomic(), rejectIfWalletUINotEnabled, hydrateUserOrReject, trackPageMiddleware, showUI.force],
  render: () => <MagicWalletPageRender />,
};

export default createFeatureModule.RPC(magic_wallet);
