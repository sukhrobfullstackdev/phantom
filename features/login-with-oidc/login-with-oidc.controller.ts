import { RpcMiddleware } from '~/app/rpc/types';
import { createRandomString } from '~/app/libs/crypto';
import { DEFAULT_TOKEN_LIFESPAN } from '~/app/rpc/routes/magic-method-routes';
import { rejectPayload, resolvePayload } from '~/app/rpc/utils';
import { sdkErrorFactories } from '~/app/libs/exceptions';
import { loginWithOIDC } from './services/open-id';
import { store } from '~/app/store';
import { setRT, setUserID, setUST } from '~/app/store/auth/auth.actions';
import { AuthThunks } from '~/app/store/auth/auth.thunks';
import { UserThunks } from '~/app/store/user/user.thunks';

type loginWithOIDCParams = [{ jwt: string; providerId: string }];
type loginWithOIDCContext = { rom: string };
type loginWithOIDCMiddleware = RpcMiddleware<loginWithOIDCParams, loginWithOIDCContext>;

export const marshallOIDCParams: loginWithOIDCMiddleware = async (ctx, next) => {
  const { payload } = ctx;
  const [{ jwt, providerId }] = payload.params as loginWithOIDCParams;

  if (!jwt || !providerId) {
    return rejectPayload(payload, sdkErrorFactories.rpc.invalidParamsError('Missing jwt or provider id.'));
  }

  // unsued for now
  ctx.rom = createRandomString(128);
  next();
};

export const oidcLoginMiddleware: loginWithOIDCMiddleware = async (ctx, next) => {
  const { payload } = ctx;
  const [{ jwt, providerId }] = payload.params as loginWithOIDCParams;

  const res = await loginWithOIDC(providerId, jwt);
  const { data } = res;

  store.dispatch(setUserID(data.auth_user_id));
  store.dispatch(setUST(data.auth_user_session_token));
  store.dispatch(setRT(data.refresh_token));
  await store.dispatch(AuthThunks.populateUserCredentials());
  const token = await store.dispatch(UserThunks.createDIDTokenForUser(DEFAULT_TOKEN_LIFESPAN));

  if (token) {
    return resolvePayload(payload, token);
  }

  next();
};
