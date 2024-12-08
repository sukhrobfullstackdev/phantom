import { RpcMiddleware } from '../types';
import { getPayloadData, handleHydrateUserOrReject } from '../utils';
import { setDeviceShare } from '~/app/store/auth/auth.actions';

/**
 * Hydrate the active user in state, populate the user information, and
 * continue. This middleware rejects the payload if anything fails.
 */
export const hydrateUserOrReject: RpcMiddleware = async ({ payload, dispatch }, next) => {
  const { jwt, rt, deviceShare } = getPayloadData(payload);
  await handleHydrateUserOrReject({ jwt, rt, readStorage: true });
  if (deviceShare) {
    await dispatch(setDeviceShare(deviceShare));
  }
  next();
};
