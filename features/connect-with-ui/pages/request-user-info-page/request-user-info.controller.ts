import { JsonRpcRequestPayload } from 'magic-sdk';
import { RpcMiddleware } from '~/app/rpc/types';
import { store } from '~/app/store';
import { connectStore } from '~/features/connect-with-ui/store';
import { resolvePayload, getPayloadData, handleHydrateUserOrReject, handleHydrateUser } from '~/app/rpc/utils';
import { connectMiddleware } from '~/features/connect-with-ui/connect-with-ui.controller';
import { getLoginMethod } from '~/features/connect-with-ui/utils/get-login-method';
import { sdkErrorFactories } from '~/app/libs/exceptions';
import { SupportedWallets } from '~/app/constants/third-party-wallets';
import { setRequestUserInfoRouteParams } from '~/app/store/user/user.actions';
import { TeamSubscriptionService } from '~/app/services/team-subscription';
import { SubscriptionFeature } from '~/shared/types/team-subscription-response';

type requestUserInfoParams = [{ isResponseRequired: boolean }];
type newRequestUserInfoParamsType = [{ scope: { email: 'required' | 'optional' } }];
type requestUserInfoContext = {};
type requestUserInfoParamsMiddleware = RpcMiddleware<
  requestUserInfoParams | newRequestUserInfoParamsType,
  requestUserInfoContext
>;

export const isLoginMethodAThirdPartyWallet = async () => {
  await connectStore.ready;

  const loginMethod = getLoginMethod();

  return SupportedWallets.includes(loginMethod?.mc.loginMethod || '');
};

export const tryHydrateMagicUser: requestUserInfoParamsMiddleware = async (ctx, next) => {
  const isThirdPartyWallet = await isLoginMethodAThirdPartyWallet();
  const { jwt, rt } = getPayloadData(ctx.payload);

  if (isThirdPartyWallet) {
    await handleHydrateUser({ jwt, rt });
  }

  if (!isThirdPartyWallet) {
    await handleHydrateUserOrReject({ jwt, rt });
  }

  next();
};

export const premiumFeatureCheck: requestUserInfoParamsMiddleware = async (ctx, next) => {
  const isThirdPartyWallet = await isLoginMethodAThirdPartyWallet();

  if (isThirdPartyWallet) {
    const res = await TeamSubscriptionService.retrieve();

    if (!res.data.enabled_features.includes(SubscriptionFeature.CONNECT_PREMIUM)) {
      throw sdkErrorFactories.client.invalidSubscription();
    }
  }

  next();
};

export const marshallRequestUserInfoParams: requestUserInfoParamsMiddleware = async (ctx, next) => {
  await store.ready;

  const { payload } = ctx;

  // Handle if new format
  const newRequestUserInfoParams = payload?.params as newRequestUserInfoParamsType;
  const newIsResponseRequired = newRequestUserInfoParams[0]?.scope?.email === 'required';

  // Handle if legacy format
  const legacyIsResponseRequired = (payload?.params as requestUserInfoParams)[0]?.isResponseRequired;

  const isResponseRequired = newIsResponseRequired || legacyIsResponseRequired;
  store.dispatch(setRequestUserInfoRouteParams({ isResponseRequired }));

  next();
};

export const resolveIfDappEmailConsentGranted: connectMiddleware = async (ctx, next) => {
  if (store.getState().Auth.userConsent?.email) {
    await resolveUserDataRequest(ctx.payload);
  } else {
    next();
  }
};

export const resolveUserDataRequest = async (payload?: JsonRpcRequestPayload) => {
  const threadPayload = payload || (store.getState().UIThread.payload as JsonRpcRequestPayload);
  const email = store.getState().Auth.userEmail;
  await resolvePayload(threadPayload, { email });
};
