import { get, has } from '~/app/libs/lodash-utils';
import { DkmsService } from '~/app/services/dkms';
import { createBridge } from '../../libs/ledger';
import { RpcRouter } from '../utils/rpc-router';

// Actions & Thunks
import { SystemThunks } from '../../store/system/system.thunks';
import { hydrateUserOrReject } from '../controllers/user.controller';
import { multiChainRerouteRPC } from '~/app/rpc/controllers/feature-route.controller';
import { getWalletType } from '~/app/libs/network';

export async function createLedgerMethodRoutes() {
  const { ledgerBridge, ledgerMethodsMapping } = await createBridge();

  const ledgerRoutes = new RpcRouter();

  ledgerRoutes.use(multiChainRerouteRPC);

  for (const [rpcMethod, bridgeMethod] of Object.entries(ledgerMethodsMapping)) {
    const walletType = getWalletType();

    ledgerRoutes.use(rpcMethod, hydrateUserOrReject, async ({ payload, getState, dispatch }) => {
      if (has(ledgerBridge, 'init')) {
        await ledgerBridge.init();
      }
      const { delegatedWalletInfo, userKeys, deviceShare } = getState().Auth;
      const { systemClockOffset, walletSecretMangementInfo } = getState().System;
      let privateKey = await DkmsService.reconstructWalletPk(
        userKeys,
        walletType,
        walletSecretMangementInfo,
        delegatedWalletInfo,
        deviceShare,
        systemClockOffset,
      );

      const result = await get(ledgerBridge, bridgeMethod)(payload, privateKey);

      (privateKey as any) = null;

      await dispatch(SystemThunks.resolveJsonRpcResponse({ payload, result }));
    });
  }

  return ledgerRoutes;
}
