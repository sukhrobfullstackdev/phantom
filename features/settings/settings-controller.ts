import { RpcMiddleware } from '~/app/rpc/types';
import { rejectPayload } from '~/app/rpc/utils';
import { store } from '~/app/store';
import { routeJsonRpcMethod } from '~/app/rpc';
import { DeepLinkPage } from 'magic-sdk';
import {
  MAGIC_AUTH_DISABLE_MFA_FLOW,
  MAGIC_AUTH_EDIT_RECOVERY_FLOW,
  MAGIC_AUTH_ENABLE_MFA_FLOW,
  MAGIC_AUTH_SETUP_RECOVERY_FLOW,
  MAGIC_AUTH_UPDATE_EMAIL_V2,
} from '~/app/constants/route-methods';
import { recoveryStore } from '~/features/recovery/store';
import { checkRecoveryFactor } from '~/features/recovery/store/recovery.thunks';
import { initRecoveryState, setDeepLink } from '~/features/recovery/store/recovery.actions';
import { sdkErrorFactories } from '~/app/libs/exceptions';
import { AuthenticationService } from '~/app/services/authentication';
import { RecencyThunks } from '~/features/recency-check/store/recency.thunks';
import { recencyStore } from '~/features/recency-check/store';

export const marshalSettingsParams: RpcMiddleware = async (ctx, next) => {
  const { payload } = ctx;
  const { userID } = store.getState().Auth;
  const page: string = payload.params?.[0]?.page;
  await recoveryStore.dispatch(initRecoveryState());

  if (page === DeepLinkPage.UpdateEmail) {
    recoveryStore.dispatch(setDeepLink(true));
    await recencyStore.dispatch(RecencyThunks.probeRecency(page));
    payload.method = MAGIC_AUTH_UPDATE_EMAIL_V2;
    routeJsonRpcMethod(payload);
    return;
  }

  if (page === DeepLinkPage.MFA) {
    try {
      const res = await AuthenticationService.getUser(userID);
      const isMfaEnabled = res.data.auth_user_mfa_active;

      payload.method = isMfaEnabled ? MAGIC_AUTH_DISABLE_MFA_FLOW : MAGIC_AUTH_ENABLE_MFA_FLOW;
      routeJsonRpcMethod(payload);
      return;
    } catch {
      throw sdkErrorFactories.client.userDeniedAccountAccess();
    }
  }

  if (page === DeepLinkPage.Recovery) {
    const { System } = store.getState();
    if (!System.LAUNCH_DARKLY_FEATURE_FLAGS['is-sms-recovery-enabled']) {
      rejectPayload(payload, sdkErrorFactories.rpc.methodNotFoundError('Method not enabled, please contact support.'));
      return;
    }
    await recoveryStore.dispatch(setDeepLink(true));
    await recoveryStore.dispatch(checkRecoveryFactor());
    await recencyStore.dispatch(RecencyThunks.probeRecency(page));
    const { currentFactorId } = recoveryStore.getState();
    if (currentFactorId) {
      payload.method = MAGIC_AUTH_EDIT_RECOVERY_FLOW;
    } else {
      payload.method = MAGIC_AUTH_SETUP_RECOVERY_FLOW;
    }
    routeJsonRpcMethod(payload);
    return;
  }
  next();
};
