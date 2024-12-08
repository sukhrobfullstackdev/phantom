import { rejectPayload, resolvePayload } from '~/app/rpc/utils';
import { sdkErrorFactories } from '~/app/libs/exceptions';
import { RpcMiddleware } from '~/app/rpc/types';
import { store } from '~/app/store';
import { setCustomAuthorizationToken } from '~/app/store/auth/auth.actions';

type customAuthParams = [{ jwt: string }];
type loginWithOIDCMiddleware = RpcMiddleware<customAuthParams>;

export const marshallAuthorizationJwtParams: loginWithOIDCMiddleware = async (ctx, next) => {
  const { payload } = ctx;
  const [{ jwt }] = payload.params as customAuthParams;

  if (!jwt) {
    return rejectPayload(payload, sdkErrorFactories.rpc.invalidParamsError('Missing jwt.'));
  }

  next();
};

export const setAuthorizationMiddleware = async (ctx, next) => {
  const { payload } = ctx;
  const [{ jwt }] = payload.params as customAuthParams;

  store.dispatch(setCustomAuthorizationToken(jwt));

  await resolvePayload(payload, true);

  next();
};
