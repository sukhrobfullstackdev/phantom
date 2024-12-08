import React from 'react';
import { atomic } from '~/app/rpc/controllers/atomic-lock.controller';
import { showUI } from '~/app/rpc/controllers/ui.controller';
import { RpcRouteConfig } from '~/app/rpc/utils/rpc-router';
import { createFeatureModule } from '~/features/framework';
import { redirectThirdPartyWallet, resolvePublicAddressIfLoggedIn } from '../connect-with-ui.controller';
import { OldLoginFormPageRender } from './mwui_eth_accounts';

const mwui_eth_requestAccounts: RpcRouteConfig = {
  middlewares: [atomic(), redirectThirdPartyWallet, resolvePublicAddressIfLoggedIn, showUI.force],
  render: () => <OldLoginFormPageRender />,
};

export default createFeatureModule.RPC(mwui_eth_requestAccounts);
