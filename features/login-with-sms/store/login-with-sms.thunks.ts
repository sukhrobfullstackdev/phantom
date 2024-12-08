import { setRT, setUserID, setUserPhoneNumber, setUST } from '~/app/store/auth/auth.actions';
import { DEFAULT_SMS_TOKEN_LIFESPAN } from '../login-with-sms.controller';
import { UserThunks } from '~/app/store/user/user.thunks';
import { rejectPayload, resolvePayload } from '~/app/rpc/utils';
import { AuthThunks } from '~/app/store/auth/auth.thunks';
import { ThunkActionWrapper } from '~/app/store/types';
import { store } from '~/app/store';
import { sdkErrorFactories } from '~/app/libs/exceptions';
import { LoginWithSms } from './login-with-sms.reducer';
import { setIsCloseButtonEnabled } from './login-with-sms.actions';

export function smsCreateDID(
  auth_user_id: string,
  auth_user_session_token: string,
  refreshToken?: string,
): ThunkActionWrapper<Promise<string>, typeof LoginWithSms> {
  return async (dispatch, getState) => {
    const { phoneNumber, rom } = getState();

    if (!rom) {
      return Promise.reject(new Error('Cannot resulve sms without rom'));
    }

    await dispatch(setIsCloseButtonEnabled(false));
    store.dispatch(setUserID(auth_user_id));
    store.dispatch(setUST(auth_user_session_token));
    store.dispatch(setRT(refreshToken));
    // after success pass phone to main auth store
    // super awkward but has to be done
    store.dispatch(setUserPhoneNumber(phoneNumber));
    await store.dispatch(AuthThunks.persistSessionCookies(rom));
    await store.dispatch(AuthThunks.populateUserCredentials());
    const token = await store.dispatch(UserThunks.createDIDTokenForUser(DEFAULT_SMS_TOKEN_LIFESPAN));

    if (!token) {
      return Promise.reject(new Error('Failed to create DID during SMS flow'));
    }

    return token;
  };
}

export function smsResolvePayloadWithDID(did: string): ThunkActionWrapper<Promise<void>, typeof LoginWithSms> {
  return async () => {
    const { payload } = store.getState().UIThread;

    if (!payload) {
      return Promise.reject(new Error('No payload on UI thread'));
    }

    await resolvePayload(payload, did);
  };
}

export function resolveSmsVerified(
  auth_user_id: string,
  auth_user_session_token: string,
  refreshToken?: string,
): ThunkActionWrapper<Promise<void>, typeof LoginWithSms> {
  return async dispatch => {
    const token = await dispatch(smsCreateDID(auth_user_id, auth_user_session_token, refreshToken));
    await dispatch(smsResolvePayloadWithDID(token));
  };
}

export function rejectLoginInvalidPhone(): ThunkActionWrapper<Promise<void>, typeof LoginWithSms> {
  return async () => {
    const { payload } = store.getState().UIThread;

    if (!payload) {
      return Promise.reject(new Error('No payload on UI thread'));
    }

    await rejectPayload(payload, sdkErrorFactories.rpc.invalidParamsError('invalid phone number'));
  };
}

export function rejectLoginLockoutLifted(): ThunkActionWrapper<Promise<void>, typeof LoginWithSms> {
  return async () => {
    const { payload } = store.getState().UIThread;

    if (!payload) {
      return Promise.reject(new Error('No payload on UI thread'));
    }

    await rejectPayload(payload, sdkErrorFactories.rpc.invalidRequestError('User lockout lifted'));
  };
}

export function rejectUserCancelled(): ThunkActionWrapper<Promise<void>, typeof LoginWithSms> {
  return async () => {
    const { payload } = store.getState().UIThread;

    if (!payload) {
      return Promise.reject(new Error('No payload on UI thread'));
    }

    await rejectPayload(payload, sdkErrorFactories.rpc.invalidRequestError('User cancelled'));
  };
}
