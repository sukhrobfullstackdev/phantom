import React from 'react';
import { createFeatureModule } from '~/features/framework';
import { RpcRouteConfig } from '~/app/rpc/utils/rpc-router';
import { atomic } from '~/app/rpc/controllers/atomic-lock.controller';
import { browserEnvironmentCheck, marshallDecryptV1Params } from '../gdkms-v1-controller';
import { ifGlobalAppScopeRejectMagicRPC } from '~/app/rpc/controllers/feature-route.controller';
import { hydrateUserOrReject } from '~/app/rpc/controllers/user.controller';

const magic_auth_decrypt_v1: RpcRouteConfig = {
  middlewares: [
    atomic(),
    browserEnvironmentCheck,
    ifGlobalAppScopeRejectMagicRPC,
    hydrateUserOrReject,
    marshallDecryptV1Params,
  ],
  render: () => <div />,
};

export default createFeatureModule.RPC(magic_auth_decrypt_v1);
