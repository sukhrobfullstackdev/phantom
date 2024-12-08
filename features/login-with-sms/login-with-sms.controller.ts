import { smsLoginStore } from './store';
import { RpcMiddleware } from '~/app/rpc/types';
import { createRandomString } from '~/app/libs/crypto';
import { DEFAULT_TOKEN_LIFESPAN } from '~/app/rpc/routes/magic-method-routes';
import { store } from '~/app/store';
import { getPayloadData, handleHydrateUser, resolvePayload } from '~/app/rpc/utils';
import { AuthThunks } from '~/app/store/auth/auth.thunks';
import { UserThunks } from '~/app/store/user/user.thunks';

import { setIsCloseButtonEnabled, setLoginWithSmsPhoneNumber, setSmsRom } from './store/login-with-sms.actions';
import { resolveSmsVerified } from './store/login-with-sms.thunks';

type loginWithSmsParams = [{ phoneNumber: string; showUI: boolean }];
type loginWithSmsContext = { phoneNumber: string; rom: string; defaultTokenLifespan: number };
type loginWithSmsMiddleware = RpcMiddleware<loginWithSmsParams, loginWithSmsContext>;

export const DEFAULT_SMS_TOKEN_LIFESPAN = DEFAULT_TOKEN_LIFESPAN;

export const marshalSmsParams: loginWithSmsMiddleware = async (ctx, next) => {
  await smsLoginStore.ready;

  const { payload } = ctx;

  const [{ phoneNumber: phoneNumberRaw }] = payload.params as loginWithSmsParams;
  ctx.phoneNumber = phoneNumberRaw.trim();
  ctx.rom = createRandomString(128);
  smsLoginStore.dispatch(setLoginWithSmsPhoneNumber(ctx.phoneNumber));
  smsLoginStore.dispatch(setSmsRom(ctx.rom));
  smsLoginStore.dispatch(setIsCloseButtonEnabled(true));
  next();
};

export const ifUserLoggedInThenResolve: loginWithSmsMiddleware = async (ctx, next) => {
  const { payload, dispatch, phoneNumber } = ctx;

  const { jwt, rt } = getPayloadData(payload);
  const hydrated = await handleHydrateUser({ rt, jwt });
  const { Auth } = store.getState();
  const { userPhoneNumber } = Auth;

  const isLoggedIn = hydrated && !!Auth.ust;

  if (isLoggedIn) {
    if (userPhoneNumber === phoneNumber) {
      try {
        const token = await dispatch(UserThunks.createDIDTokenForUser(ctx.defaultTokenLifespan));
        return resolvePayload(payload, token);
      } catch {
        // User is not logged in....so we logem out and continue
      }
    }
    await dispatch(AuthThunks.logout({ shouldCallLogoutApi: false }));
  }

  next();
};

export const resolveSdkSms = (authUserId, authSessionToken, refreshToken) => {
  smsLoginStore.dispatch(resolveSmsVerified(authUserId, authSessionToken, refreshToken));
};
