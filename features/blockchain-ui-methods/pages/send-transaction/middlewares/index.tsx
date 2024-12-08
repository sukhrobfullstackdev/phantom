import { sdkErrorFactories } from '~/app/libs/exceptions';
import { RpcMiddleware } from '~/app/rpc/types';
import { store } from '~/app/store';
import { setSendTransactionRouteParams } from '~/app/store/user/user.actions';
import { SendTransactionRouteParams } from '~/app/store/user/user.reducer';

type sendTransactionContext = {};
type sendTransactionParamsMiddleware = RpcMiddleware<SendTransactionRouteParams, sendTransactionContext>;

export const marshallSendTransactionParams: sendTransactionParamsMiddleware = async (ctx, next) => {
  await store.ready;

  const params = ctx.payload.params?.[0];
  if (!params) {
    throw sdkErrorFactories.client.malformedPayload;
  }

  const { publicAddress } = ctx.getState().Auth.userKeys;
  const from = params.from ?? publicAddress;
  if (!from) {
    throw sdkErrorFactories.client.malformedPayload;
  }

  store.dispatch(
    setSendTransactionRouteParams({
      from,
      to: params.to,
      value: params.value ?? '0',
      data: params.data ?? '0x0',
    }),
  );

  next();
};
