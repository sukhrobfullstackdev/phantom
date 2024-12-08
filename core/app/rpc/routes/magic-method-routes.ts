import { isEmpty } from '~/app/libs/lodash-utils';
import { LoginMethodType } from '~/app/constants/flags';
import * as RouteMethods from '~/app/constants/route-methods';
import { AuthenticationService } from '~/app/services/authentication';
import { WebAuthnService } from '~/app/services/webauthn';
import { sdkErrorFactories } from '../../libs/exceptions';
import { transformCredentialCreateOptions, transformCredentialRequestOptions } from '../../libs/webauthn';
import { RpcRouter } from '../utils/rpc-router';

// Actions & Thunks
import { AuthThunks } from '../../store/auth/auth.thunks';
import { SystemThunks } from '../../store/system/system.thunks';
import { UserThunks } from '../../store/user/user.thunks';

// Controllers
import { RpcIntermediaryEventService } from '~/app/services/rpc-intermediary-event';
import { atomic } from '../controllers/atomic-lock.controller';
import { marshallCredentialLoginParams, verifyMagicCredential } from '../controllers/credential-login.controller';
import { ifGlobalAppScopeRejectMagicRPC, magicRerouteRPC } from '../controllers/feature-route.controller';
import {
  checkIfShouldForceUI,
  checkIfUserIsAlreadyLoggedIn,
  doMagicLinkLoginFlow,
  marshallLoginParams,
  retryMagicLinkLoginFlow,
} from '../controllers/magic-link-login.controller';
import { showUI, uiAtomicLockPredicate } from '../controllers/ui.controller';
import { hydrateUserOrReject } from '../controllers/user.controller';
import { getPayloadData, handleHydrateUser, resolvePayload } from '../utils';

export const DEFAULT_TOKEN_LIFESPAN = 60 * 15; // 15 minutes as seconds

export const magicMethodRoutes = new RpcRouter();

magicMethodRoutes.use(magicRerouteRPC);
magicMethodRoutes.use(ifGlobalAppScopeRejectMagicRPC);

magicMethodRoutes
  .use(
    RouteMethods.MagicAuthLoginWithMagicLink,
    checkIfShouldForceUI,
    atomic(uiAtomicLockPredicate),
    marshallLoginParams,
    checkIfUserIsAlreadyLoggedIn,
    showUI,
    doMagicLinkLoginFlow,
  )
  .uiEvent('retry', retryMagicLinkLoginFlow)
  .provideInitialContext(() => ({ defaultTokenLifespan: DEFAULT_TOKEN_LIFESPAN }));

magicMethodRoutes
  .use(RouteMethods.MagicAuthLoginWithCredential, marshallCredentialLoginParams, verifyMagicCredential)
  .provideInitialContext(() => ({ defaultTokenLifespan: DEFAULT_TOKEN_LIFESPAN }));

magicMethodRoutes.use(
  [RouteMethods.MagicAuthGetAccessToken, RouteMethods.MagicAuthGetIDToken],
  hydrateUserOrReject,
  async ({ payload, dispatch }) => {
    let ls = DEFAULT_TOKEN_LIFESPAN;
    if (!isEmpty(payload.params[0])) {
      const [{ lifespan }] = payload.params as [{ lifespan: number }];
      if (lifespan) ls = lifespan;
    }
    const token = await dispatch(UserThunks.createDIDTokenForUser(ls));
    await dispatch(SystemThunks.resolveJsonRpcResponse({ payload, result: token }));
  },
);

magicMethodRoutes.use(RouteMethods.MagicAuthGenerateIDToken, hydrateUserOrReject, async ({ payload, dispatch }) => {
  let att: string | undefined;
  let ls = DEFAULT_TOKEN_LIFESPAN;
  if (!isEmpty(payload.params[0])) {
    const [{ attachment, lifespan }] = payload.params as [{ attachment: string | undefined; lifespan: number }];
    if (attachment) att = attachment;
    if (lifespan) ls = lifespan;
  }
  const token = await dispatch(UserThunks.createDIDTokenForUser(ls, att));
  await dispatch(SystemThunks.resolveJsonRpcResponse({ payload, result: token }));
});

magicMethodRoutes.use(RouteMethods.MagicAuthIsLoggedIn, async ({ payload, dispatch, getState }) => {
  const { jwt, rt } = getPayloadData(payload);
  const hydrated = await handleHydrateUser({ jwt, rt });
  const isLoggedIn = hydrated && !!getState().Auth.ust;
  await dispatch(SystemThunks.resolveJsonRpcResponse({ payload, result: isLoggedIn }));
});

magicMethodRoutes.use(RouteMethods.MagicAuthLogout, async ({ payload, dispatch, getState }) => {
  // this has been rerouted to magic_disconnect. See magicRerouteRPC
  try {
    if (getState().Auth.userID) await dispatch(AuthThunks.logout());
    await dispatch(SystemThunks.resolveJsonRpcResponse({ payload, result: true }));
  } catch {
    await sdkErrorFactories.rpc.internalError().sdkReject(payload);
  }
});

magicMethodRoutes.use(RouteMethods.MagicAuthWebAuthnRegistrationStart, async ({ payload, dispatch }) => {
  const params = payload.params[0];

  const { data } = await WebAuthnService.registrationStart(params.username);
  const credential_options = transformCredentialCreateOptions(data.credential_options);

  await dispatch(
    SystemThunks.resolveJsonRpcResponse({
      payload,
      result: {
        id: data.webauthn_user_id,
        credential_options,
      },
    }),
  );
});

magicMethodRoutes.use(RouteMethods.MagicAuthWebAuthnRegister, async ({ payload, dispatch }) => {
  const params = payload.params[0];
  const registration_response = {
    attObj: params.registration_response.attObj,
    clientData: params.registration_response.clientData,
  };

  const transport = isEmpty(params.transport) ? 'unknown' : params.transport[0];

  try {
    const { data } = await WebAuthnService.register(
      params.id,
      params.nickname,
      transport,
      params.user_agent,
      registration_response,
    );

    dispatch(
      AuthThunks.processWebAuthnLoginSession(
        data.auth_user_id,
        data.auth_user_session_token,
        payload,
        DEFAULT_TOKEN_LIFESPAN,
      ),
    );
  } catch (e) {
    await sdkErrorFactories.client.webAuthnRegistrationFailed().sdkReject(payload);
  }
});

magicMethodRoutes.use(RouteMethods.MagicAuthLoginWithWebAuthn, async ({ payload, dispatch }) => {
  const { username } = payload.params[0];

  const { data } = await WebAuthnService.webAuthnReAuthStart(username);

  const options = data.assertion_options;

  await dispatch(
    SystemThunks.resolveJsonRpcResponse({
      payload,
      result: transformCredentialRequestOptions(options),
    }),
  );
});

magicMethodRoutes.use(RouteMethods.MagicAuthLoginWithWebAuthnVerify, async ({ payload, dispatch }) => {
  const { username, assertion_response } = payload.params[0];

  try {
    const { data } = await WebAuthnService.reauthVerify(username, assertion_response);

    dispatch(
      AuthThunks.processWebAuthnLoginSession(
        data.auth_user_id,
        data.auth_user_session_token,
        payload,
        DEFAULT_TOKEN_LIFESPAN,
      ),
    );
  } catch (e) {
    await sdkErrorFactories.client.webAuthnRegistrationFailed().sdkReject(payload);
  }
});

magicMethodRoutes.use(
  RouteMethods.MagicAuthRegisterWebAuthnDeviceStart,
  hydrateUserOrReject,
  async ({ payload, dispatch, getState }) => {
    const { userID } = getState().Auth;

    const { data } = await WebAuthnService.registerDeviceStart(userID);
    const credential_options = transformCredentialCreateOptions(data.credential_options);

    await dispatch(
      SystemThunks.resolveJsonRpcResponse({
        payload,
        result: {
          credential_options,
        },
      }),
    );
  },
);

magicMethodRoutes.use(
  RouteMethods.MagicAuthRegisterWebAuthnDevice,
  hydrateUserOrReject,
  async ({ payload, dispatch, getState }) => {
    const { userID } = getState().Auth;
    const params = payload.params[0];
    const registration_response = {
      attObj: params.registration_response.attObj,
      clientData: params.registration_response.clientData,
    };

    const transport = isEmpty(params.transport) ? 'unknown' : params.transport[0];

    await WebAuthnService.registerDevice(userID, params.nickname, transport, params.user_agent, registration_response);

    await dispatch(SystemThunks.resolveJsonRpcResponse({ payload, result: true }));
  },
);

magicMethodRoutes.use(
  RouteMethods.MagicUserGetWebAuthnCredentials,
  hydrateUserOrReject,
  async ({ payload, dispatch, getState }) => {
    const { userID } = getState().Auth;
    const { login } = (await AuthenticationService.getUser(userID)).data as any;
    let result = {};

    if (login.type === LoginMethodType.WebAuthn) {
      result = {
        devicesInfo: login.webauthn.devices_info,
        username: login.webauthn.username,
      };
      await dispatch(
        SystemThunks.resolveJsonRpcResponse({
          payload,
          result,
        }),
      );
    } else {
      throw await sdkErrorFactories.client.webAuthnLoggedInError();
    }
  },
);

magicMethodRoutes.use(
  RouteMethods.MagicUserUnregisterWebAuthn,
  hydrateUserOrReject,
  async ({ payload, dispatch, getState }) => {
    const { userID } = getState().Auth;
    const { webAuthnCredentialsId } = payload.params[0];

    try {
      await WebAuthnService.unregister(userID, webAuthnCredentialsId);
      await dispatch(SystemThunks.resolveJsonRpcResponse({ payload, result: true }));
    } catch (e) {
      await sdkErrorFactories.client.webAuthnUnableFindDevice().sdkReject(payload);
    }
  },
);

magicMethodRoutes.use(
  RouteMethods.MagicUserUpdateWebAuthn,
  hydrateUserOrReject,
  async ({ payload, dispatch, getState }) => {
    const { userID } = getState().Auth;
    const { webAuthnCredentialsId, nickname } = payload.params[0];

    try {
      await WebAuthnService.update(userID, webAuthnCredentialsId, nickname);
      await dispatch(SystemThunks.resolveJsonRpcResponse({ payload, result: true }));
    } catch (e) {
      await sdkErrorFactories.client.webAuthnUnableFindDevice().sdkReject(payload);
    }
  },
);

magicMethodRoutes.use(RouteMethods.MagicIntermediaryEvent, async ({ payload }) => {
  const { eventType, payloadId, args } = payload.params[0];
  RpcIntermediaryEventService.emit(eventType, payloadId, args);
  resolvePayload(payload, true);
});
