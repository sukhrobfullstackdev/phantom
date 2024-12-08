import { rejectPayload, resolvePayload } from '~/app/rpc/utils';
import { ThunkActionWrapper } from '~/app/store/types';
import { store } from '~/app/store';
import { sdkErrorFactories } from '~/app/libs/exceptions';
import { Mfa } from './mfa.reducer';

export function resolveMfaComplete(): ThunkActionWrapper<Promise<void>, typeof Mfa> {
  return async () => {
    const { payload } = store.getState().UIThread;
    if (!payload) {
      return Promise.reject(new Error('No payload on UI thread'));
    }

    await resolvePayload(payload, true);
  };
}

export function rejectUserCancelled(): ThunkActionWrapper<Promise<void>, typeof Mfa> {
  return async () => {
    const { payload } = store.getState().UIThread;

    if (!payload) {
      return Promise.reject(new Error('No payload on UI thread'));
    }

    await rejectPayload(payload, sdkErrorFactories.rpc.invalidRequestError('User cancelled'));
  };
}
