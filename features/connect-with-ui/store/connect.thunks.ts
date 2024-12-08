import { rejectPayload, resolvePayload } from '~/app/rpc/utils';
import { ThunkActionWrapper } from '~/app/store/types';
import { store } from '~/app/store';
import { sdkErrorFactories } from '~/app/libs/exceptions';
import { ConnectReducer } from './connect.reducer';
import {
  setThirdPartyWallet,
  setThirdPartyWalletLoginFlowStartResponse,
  setThirdPartyWalletRequestUserInfo,
  setWalletConnectionsInfo,
} from './connect.actions';
import { AuthThunks } from '~/app/store/auth/auth.thunks';

export function resolveExample(): ThunkActionWrapper<Promise<void>, typeof ConnectReducer> {
  return async (dispatch, getState) => {
    const { payload } = store.getState().UIThread;
    if (!payload) {
      return Promise.reject(new Error('No payload on UI thread'));
    }

    await resolvePayload(payload, 'blah');
  };
}

export function rejectLoginInvalidPhone(): ThunkActionWrapper<Promise<void>, typeof ConnectReducer> {
  return async () => {
    const { payload } = store.getState().UIThread;

    if (!payload) {
      return Promise.reject(new Error('No payload on UI thread'));
    }

    await rejectPayload(payload, sdkErrorFactories.rpc.invalidParamsError('An error'));
  };
}

export function connectLogout(): ThunkActionWrapper<Promise<void>, typeof ConnectReducer> {
  const authState = store.getState().Auth;
  const isLoggedIn = !!authState?.userID && !!authState?.ust;
  return async dispatch => {
    await store.dispatch(AuthThunks.logout({ shouldCallLogoutApi: isLoggedIn }));
    await dispatch(setWalletConnectionsInfo(undefined));
    await dispatch(setThirdPartyWallet(undefined));
    await dispatch(setThirdPartyWalletLoginFlowStartResponse(undefined));
    await dispatch(setThirdPartyWalletRequestUserInfo(undefined));
  };
}
