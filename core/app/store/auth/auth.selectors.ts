import { AuthState } from './auth.reducer';

const getAuthState = (store: any) => (store.Auth || {}) as AuthState;

export const getAuthUserRT = store => getAuthState(store).rt;

export const getDeviceShare = store => getAuthState(store).deviceShare;
