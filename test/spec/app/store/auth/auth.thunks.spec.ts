import sinon from 'sinon';

import { AuthThunks } from '~/app/store/auth/auth.thunks';
import { AuthenticationService } from '~/app/services/authentication';
import { createRandomString } from '~/app/libs/crypto';
import { mockCoreStore } from '../../../_utils/mockStore';
import {
  ControlFlowErrorCode,
  createControlFlowError,
  createSDKError,
  createServiceError,
  isControlFlowError,
  isSDKError,
  sdkErrorFactories,
} from '~/app/libs/exceptions';
import { dummyPromise } from '~/test/spec/_utils/dummy-promise';
import {
  hydrateActiveUserFromCookiesActions,
  hydrateActiveUserFromDPoPActions,
  loginWithCredentialActions,
  loginWithMagicLinkWithRedirectUriActions,
  logoutActions,
} from '~/test/data/auth.actions';
import { mockEnv, stubGetOptionsFromEndpoint } from '../../../_utils/stubs';
import { SystemThunks } from '~/app/store/system/system.thunks';
import { UserThunks } from '~/app/store/user/user.thunks';
import * as Env from '~/shared/constants/env';
import { SessionService } from '~/app/services/session';

const publicAddress = '0x3750B8eF5AB747D986B935d6316d7E76059dD4Ee';
const encrypted_private_address = 'mock encryptedPrivateAddress';
const client_id = 'client_id';

const mockRandomStringResult = 'randomString';
const mockEmail = 'test@magic.link';
const mockRedirectURI = 'redirect.magic.link';
const mockPayload = { id: 1, jsonrpc: '2.0', method: '', params: [] };
const mockAuthUserID = 'mock auth user id';
const mockUST = 'mock user session token';
const mockRT = 'luk mah, refresj token';
const mockROM = 'mock request origin message';
const mockMagicCredential = 'mock magic credential';
const mockTempLoginToken = 'mock tempLoginToken';
const mockTokenTimeSpan = 'mock time span';

const initState = {
  Auth: {
    userEmail: mockEmail,
    userID: mockAuthUserID,
  },
  System: {
    isJsonRpcMessageChannelOpen: false,
    isThemePreviewMessageChannelOpen: false,
    isOverlayShowing: false,
    showUI: false,
    systemClockOffset: 0,
  },
};

const mockMagicTrue = {
  ...Env,
  IS_MAGIC: true,
  IS_STATIC_DEPLOYMENT: false,
  DATADOG_CLIENT_KEY: '',
};

const mockMagicFalse = {
  ...Env,
  IS_MAGIC: false,
  IS_STATIC_DEPLOYMENT: true,
  DATADOG_CLIENT_KEY: '',
};

let sandbox: sinon.SinonSandbox;

beforeEach(() => {
  sandbox = sinon.createSandbox();
  (createRandomString as any) = sandbox.stub().returns(mockRandomStringResult);
  jest.resetModules();
});

test('#1 loginWithMagicLink successfully', async () => {
  const store = mockCoreStore({});

  const stub0 = sandbox.stub(AuthThunks, 'sendMagicLink');
  const stub1 = sandbox.stub(AuthThunks, 'waitForDeviceVerified');
  const stub2 = sandbox.stub(AuthThunks, 'waitForMagicLinkClicked');
  const stub3 = sandbox.stub(AuthThunks, 'persistSessionCookies');
  const stub4 = sandbox.stub(AuthThunks, 'populateUserCredentials');
  stub0.returns(dummyPromise as any);
  stub1.returns(dummyPromise as any);
  stub2.returns(dummyPromise as any);
  stub3.returns(dummyPromise as any);
  stub4.returns(dummyPromise as any);

  await store.dispatch(AuthThunks.loginWithMagicLink(mockEmail, mockRedirectURI, mockPayload));

  const actions = store.getActions();
  expect(stub0.calledWith(mockRandomStringResult, mockRedirectURI, mockPayload)).toBe(true);
  expect(stub1.calledWith()).toBe(true);
  expect(stub2.calledWith(mockRandomStringResult)).toBe(true);
  expect(stub3.calledWith(mockRandomStringResult)).toBe(true);
  expect(stub4.calledOnce).toBe(true);

  expect(actions).toEqual(loginWithMagicLinkWithRedirectUriActions);
});

test('#2 loginWithMagicLink failed at sendMagicLink and throws user denied', async () => {
  const store = mockCoreStore({});

  const stub0 = sandbox.stub(AuthThunks, 'sendMagicLink');
  const stub1 = sandbox.stub(AuthThunks, 'waitForDeviceVerified');
  const stub2 = sandbox.stub(AuthThunks, 'waitForMagicLinkClicked');
  const stub3 = sandbox.stub(AuthThunks, 'persistSessionCookies');
  const stub4 = sandbox.stub(AuthThunks, 'populateUserCredentials');
  stub0.throws('error');
  stub1.returns(dummyPromise as any);
  stub2.returns(dummyPromise as any);
  stub3.returns(dummyPromise as any);
  stub4.returns(dummyPromise as any);

  try {
    await store.dispatch(AuthThunks.loginWithMagicLink(mockEmail, mockRedirectURI, mockPayload));
  } catch (e) {
    expect(e).toEqual(sdkErrorFactories.client.userDeniedAccountAccess());
  }

  const actions = store.getActions();
  expect(stub0.calledWith(mockRandomStringResult, mockRedirectURI, mockPayload)).toBe(true);
  expect(stub1.notCalled).toBe(true);
  expect(stub2.notCalled).toBe(true);
  expect(stub3.notCalled).toBe(true);
  expect(stub4.notCalled).toBe(true);

  expect(actions).toEqual(loginWithMagicLinkWithRedirectUriActions);
});

test('#3 loginWithMagicLink failed at sendMagicLink and throws SDKError', async () => {
  const store = mockCoreStore({});

  const stub0 = sandbox.stub(AuthThunks, 'sendMagicLink');
  const stub1 = sandbox.stub(AuthThunks, 'waitForDeviceVerified');
  const stub2 = sandbox.stub(AuthThunks, 'waitForMagicLinkClicked');
  const stub3 = sandbox.stub(AuthThunks, 'persistSessionCookies');
  const stub4 = sandbox.stub(AuthThunks, 'populateUserCredentials');
  stub0.throws(createSDKError(-32700, 'Parse error', 'message'));
  stub1.returns(dummyPromise as any);
  stub2.returns(dummyPromise as any);
  stub3.returns(dummyPromise as any);
  stub4.returns(dummyPromise as any);

  try {
    await store.dispatch(AuthThunks.loginWithMagicLink(mockEmail, mockRedirectURI, mockPayload));
  } catch (e) {
    expect(isSDKError(e)).toBe(true);
  }

  const actions = store.getActions();
  expect(stub0.calledWith(mockRandomStringResult, mockRedirectURI, mockPayload)).toBe(true);
  expect(stub1.notCalled).toBe(true);
  expect(stub2.notCalled).toBe(true);
  expect(stub3.notCalled).toBe(true);
  expect(stub4.notCalled).toBe(true);

  expect(actions).toEqual(loginWithMagicLinkWithRedirectUriActions);
});

test('#4 loginWithMagicLink failed at sendMagicLink and throws ControlError', async () => {
  const store = mockCoreStore({});

  const stub0 = sandbox.stub(AuthThunks, 'sendMagicLink');
  const stub1 = sandbox.stub(AuthThunks, 'waitForDeviceVerified');
  const stub2 = sandbox.stub(AuthThunks, 'waitForMagicLinkClicked');
  const stub3 = sandbox.stub(AuthThunks, 'persistSessionCookies');
  const stub4 = sandbox.stub(AuthThunks, 'populateUserCredentials');
  stub0.throws(createControlFlowError(ControlFlowErrorCode.UnknownError));
  stub1.returns(dummyPromise as any);
  stub2.returns(dummyPromise as any);
  stub3.returns(dummyPromise as any);
  stub4.returns(dummyPromise as any);

  try {
    await store.dispatch(AuthThunks.loginWithMagicLink(mockEmail, mockRedirectURI, mockPayload));
  } catch (e) {
    expect(isControlFlowError(e)).toBe(true);
    expect(e.code).toBe(ControlFlowErrorCode.UnknownError);
  }

  const actions = store.getActions();
  expect(stub0.calledWith(mockRandomStringResult, mockRedirectURI, mockPayload)).toBe(true);
  expect(stub1.notCalled).toBe(true);
  expect(stub2.notCalled).toBe(true);
  expect(stub3.notCalled).toBe(true);
  expect(stub4.notCalled).toBe(true);

  expect(actions).toEqual(loginWithMagicLinkWithRedirectUriActions);
});

test('#5 loginWithMagicLink failed at sendMagicLink and throws ServiceError', async () => {
  const store = mockCoreStore({});

  const stub0 = sandbox.stub(AuthThunks, 'sendMagicLink');
  const stub1 = sandbox.stub(AuthThunks, 'waitForDeviceVerified');
  const stub2 = sandbox.stub(AuthThunks, 'waitForMagicLinkClicked');
  const stub3 = sandbox.stub(AuthThunks, 'persistSessionCookies');
  const stub4 = sandbox.stub(AuthThunks, 'populateUserCredentials');
  stub0.throws(createServiceError({ error_code: 'error_code', message: 'error' }));
  stub1.returns(dummyPromise);
  stub2.returns(dummyPromise);
  stub3.returns(dummyPromise);
  stub4.returns(dummyPromise);

  try {
    await store.dispatch(AuthThunks.loginWithMagicLink(mockEmail, mockRedirectURI, mockPayload));
  } catch (e) {
    expect(isControlFlowError(e)).toBe(true);
    expect(e.code).toBe(ControlFlowErrorCode.GenericServerError);
  }

  const actions = store.getActions();
  expect(stub0.calledWith(mockRandomStringResult, mockRedirectURI, mockPayload)).toBe(true);
  expect(stub1.notCalled).toBe(true);
  expect(stub2.notCalled).toBe(true);
  expect(stub3.notCalled).toBe(true);
  expect(stub4.notCalled).toBe(true);

  expect(actions).toEqual(loginWithMagicLinkWithRedirectUriActions);
});

test('#6 sendMagicLink success', async () => {
  const store = mockCoreStore(initState);

  const stub0 = sandbox.stub(AuthenticationService, 'loginStart');
  stub0.returns(
    Promise.resolve({
      data: {
        utc_timestamp_ms: 1000,
        one_time_passcode: 123,
      },
    } as any),
  );

  const stub1 = sandbox.stub(SystemThunks, 'emitJsonRpcEvent');
  stub1.returns(dummyPromise);

  stubGetOptionsFromEndpoint({
    ext: {
      uservoiceThemeProvider: 'mock uservoiceThemeProvider',
    },
  });

  await store.dispatch(AuthThunks.sendMagicLink(mockROM, mockRedirectURI, mockPayload));

  expect(
    stub1.calledOnceWith({
      payload: mockPayload,
      event: 'email-sent',
      params: [{ security_otp: 123 }],
    }),
  ).toBe(true);
});

test('#7 sendMagicLink throws ServiceError', async () => {
  const store = mockCoreStore(initState);
  sandbox.stub(AuthenticationService, 'loginStart').throws('error!');

  const stub0 = sandbox.stub(SystemThunks, 'emitJsonRpcEvent');
  stub0.returns(dummyPromise);

  try {
    await store.dispatch(AuthThunks.sendMagicLink(mockROM, mockRedirectURI, mockPayload));
  } catch (e) {
    expect(stub0.calledOnceWith({ payload: mockPayload, event: 'email-not-deliverable' })).toBe(true);
  }
});

test('#8 persistSessionCookies success', async () => {
  const store = mockCoreStore(initState);
  const stub0 = sandbox.stub(SessionService, 'persist');
  stub0.returns(Promise.resolve({} as any));

  await store.dispatch(AuthThunks.persistSessionCookies(mockROM));

  const actions = store.getActions();

  expect(actions).toEqual([]);
});

test('#9 hydrateUserSessionFromRedirectConfirm success ', async () => {
  const store = mockCoreStore(initState);
  const env = 'testnet';

  const stub0 = sandbox.stub(AuthenticationService, 'redirectConfirm');
  stub0.returns(
    Promise.resolve({
      data: {
        auth_user_id: mockAuthUserID,
        email: mockEmail,
        ephemeral_auth_user_session_token: 'mock ephemeral_auth_user_session_token',
      },
    } as any),
  );

  const stub1 = sandbox.stub(AuthThunks, 'populateUserCredentials');
  stub1.returns(dummyPromise);

  await store.dispatch(AuthThunks.hydrateUserSessionFromRedirectConfirm(mockTempLoginToken, env));

  const actions = store.getActions();

  expect(stub0.calledOnceWith(mockTempLoginToken, env)).toBe(true);
  expect(actions).toEqual([
    { type: 'auth/INIT_AUTH_STATE' },
    { type: 'auth/SET_USER_ID', payload: mockAuthUserID },
    { type: 'auth/SET_USER_EMAIL', payload: mockEmail },
    {
      type: 'auth/SET_UST',
      payload: 'mock ephemeral_auth_user_session_token',
    },
  ]);
});

test('#10 processWebAuthnLoginSession success', async () => {
  const store = mockCoreStore(initState);

  const stub0 = sandbox.stub(AuthThunks, 'populateUserCredentials');
  stub0.returns(dummyPromise);

  const stub1 = sandbox.stub(UserThunks, 'createDIDTokenForUser');
  stub1.returns(dummyPromise);

  await store.dispatch(AuthThunks.processWebAuthnLoginSession(mockAuthUserID, mockUST, mockPayload, mockTokenTimeSpan));

  const actions = store.getActions();

  expect(stub0.called).toBe(true);
  expect(stub1.calledOnceWith(mockTokenTimeSpan as any)).toBe(true);
  expect(actions).toEqual([
    { type: 'auth/SET_USER_ID', payload: mockAuthUserID },
    { type: 'auth/SET_UST', payload: mockUST },
    { type: 'activePayload/RESET_ACTIVE_PAYLOAD' },
  ]);
});

test('#12 loginWithCredential successfully', async () => {
  const store = mockCoreStore({});

  const stub0 = sandbox.stub(AuthenticationService, 'redirectLogin');
  const stub1 = sandbox.stub(AuthThunks, 'persistSessionCookies');
  const stub2 = sandbox.stub(AuthThunks, 'populateUserCredentials');
  stub0.returns(
    Promise.resolve<any>({
      data: {
        auth_user_id: mockAuthUserID,
        auth_user_session_token: mockUST,
        refresh_token: mockRT,
        email: mockEmail,
        rom: mockROM,
      },
    }),
  );
  stub1.returns(dummyPromise);
  stub2.returns(dummyPromise);

  await store.dispatch(AuthThunks.loginWithCredential(mockMagicCredential));

  const actions = store.getActions();
  expect(stub0.calledWith(mockMagicCredential)).toBe(true);
  expect(stub1.calledWith(mockROM)).toBe(true);
  expect(stub2.calledWith()).toBe(true);

  expect(actions).toEqual(loginWithCredentialActions({ mockEmail, mockAuthUserID, mockUST, mockRT }));
});

test('#13 loginWithCredential fails at AuthenticationService.redirectLogin and throws user denied', async () => {
  const store = mockCoreStore({});

  const stub0 = sandbox.stub(AuthenticationService, 'redirectLogin');
  const stub1 = sandbox.stub(AuthThunks, 'persistSessionCookies');
  const stub2 = sandbox.stub(AuthThunks, 'populateUserCredentials');
  stub0.throws('error');
  stub1.returns(dummyPromise as any);
  stub2.returns(dummyPromise as any);

  try {
    await store.dispatch(AuthThunks.loginWithCredential(mockMagicCredential));
  } catch (e) {
    expect(e).toEqual(sdkErrorFactories.client.userDeniedAccountAccess());
  }

  const actions = store.getActions();
  expect(stub0.calledWith(mockMagicCredential)).toBe(true);
  expect(stub1.notCalled).toBe(true);
  expect(stub2.notCalled).toBe(true);

  expect(actions).toEqual([{ type: 'auth/INIT_AUTH_STATE' }]);
});

test('#14 loginWithCredential catches SDKError and throws SDKError', async () => {
  const store = mockCoreStore({});

  const stub0 = sandbox.stub(AuthenticationService, 'redirectLogin');
  stub0.throws(createSDKError(-32700, 'Parse error', 'message'));

  try {
    await store.dispatch(AuthThunks.loginWithCredential(mockMagicCredential));
  } catch (e) {
    expect(isSDKError(e)).toBe(true);
  }

  expect(stub0.calledWith(mockMagicCredential)).toBe(true);
});

test('#15 loginWithCredential catches ControlFlowError and throws ControlFlowError', async () => {
  const store = mockCoreStore({});

  const stub0 = sandbox.stub(AuthenticationService, 'redirectLogin');
  stub0.throws(createControlFlowError(ControlFlowErrorCode.UnknownError));

  try {
    await store.dispatch(AuthThunks.loginWithCredential(mockMagicCredential));
  } catch (e) {
    expect(isControlFlowError(e)).toBe(true);
  }

  expect(stub0.calledWith(mockMagicCredential)).toBe(true);
});

test('#16 loginWithCredential catches ServiceError and throws ControlFlowError', async () => {
  const store = mockCoreStore({});

  const stub0 = sandbox.stub(AuthenticationService, 'redirectLogin');
  stub0.throws(createServiceError({ error_code: 'error_code', message: 'error' }));

  try {
    await store.dispatch(AuthThunks.loginWithCredential(mockMagicCredential));
  } catch (e) {
    expect(isControlFlowError(e)).toBe(true);
  }

  expect(stub0.calledWith(mockMagicCredential)).toBe(true);
});

test('#17 hydrateActiveUser from "storage" successfully (config.from unspecified)', async () => {
  const store = mockCoreStore(() => ({
    Auth: {
      userID: mockAuthUserID,
      ust: mockUST,
    },
  }));

  const stub0 = sandbox.stub(AuthThunks, 'populateUserCredentials');
  stub0.returns(dummyPromise);

  const result = await store.dispatch(AuthThunks.hydrateActiveUser());

  const actions = store.getActions();
  expect(result).toBe(true);
  expect(stub0.calledWith()).toBe(true);

  expect(actions).toEqual([]);
});

test('#18 hydrateActiveUser from "storage" successfully (config.from specified)', async () => {
  const store = mockCoreStore(() => ({
    Auth: {
      userID: mockAuthUserID,
      ust: mockUST,
    },
  }));

  const stub0 = sandbox.stub(AuthThunks, 'populateUserCredentials');
  stub0.returns(dummyPromise);

  const result = await store.dispatch(AuthThunks.hydrateActiveUser({ from: 'storage' }));

  const actions = store.getActions();
  expect(result).toBe(true);
  expect(stub0.calledWith()).toBe(true);

  expect(actions).toEqual([]);
});

test('#19 hydrateActiveUser from "cookies" successfully when "storage" is not hydrated (config.from unspecified)', async () => {
  const store = mockCoreStore(() => ({
    Auth: {
      userID: undefined,
      ust: undefined,
    },
  }));
  const MockAuthThunks = mockEnv('~/app/store/auth/auth.thunks', mockMagicTrue).AuthThunks;
  const refreshSpy = jest
    // eslint-disable-next-line
    .spyOn(require('~/app/services/session').SessionService, 'refresh')
    .mockImplementation(async () => ({
      data: {
        auth_user_id: mockAuthUserID,
        auth_user_session_token: mockUST,
        email: mockEmail,
      },
    }));
  const stub0 = sandbox.stub(MockAuthThunks, 'populateUserCredentials');
  stub0.returns(dummyPromise);

  const result = await store.dispatch(MockAuthThunks.hydrateActiveUser());

  const actions = store.getActions();
  expect(result).toBe(true);
  expect(stub0.calledWith()).toBe(true);
  expect(refreshSpy).toHaveBeenCalledWith();

  expect(actions).toEqual(hydrateActiveUserFromCookiesActions({ mockEmail, mockAuthUserID, mockUST }));
});

test('hydrateActiveUser from "dpop" successful when rt and jwt exist and cookie/storage fail', async () => {
  const mockRefreshToken = 'ima tough tootin token and I refresh like a dam';
  const mockUsedRefreshToken = 'ima used tootin token and I refresh like a wam';
  const mockJwt = 'ima jwt and I like trains';
  const expectedActions = hydrateActiveUserFromDPoPActions({ mockRefreshToken, mockAuthUserID, mockUST, mockEmail });

  const store = mockCoreStore(() => ({
    Auth: {
      userID: undefined,
      ust: undefined,
    },
  }));
  const MockAuthThunks = mockEnv('~/app/store/auth/auth.thunks', mockMagicTrue).AuthThunks;
  const dpopRefreshSpy = jest
    // eslint-disable-next-line
    .spyOn(require('~/app/services/authentication').AuthenticationService, 'getUstWithRt')
    .mockImplementation(async () => ({
      data: {
        auth_user_id: mockAuthUserID,
        auth_user_session_token: mockUST,
        refresh_token: mockRefreshToken,
        email: mockEmail,
      },
    }));
  const stub0 = sandbox.stub(MockAuthThunks, 'populateUserCredentials');
  stub0.returns(dummyPromise);

  const result = await store.dispatch(
    MockAuthThunks.hydrateActiveUser({
      rt: mockUsedRefreshToken,
      jwt: mockJwt,
    }),
  );

  const actions = store.getActions();
  expect(result).toBe(true);
  expect(stub0.calledWith()).toBe(true);
  expect(dpopRefreshSpy).toHaveBeenCalledWith(mockUsedRefreshToken, mockJwt);

  expect(actions).toEqual(expectedActions);
});

test('#20 hydrateActiveUser from "cookies" successfully (config.from specified)', async () => {
  const store = mockCoreStore(() => ({
    Auth: {
      userID: undefined,
      ust: undefined,
    },
  }));
  const MockAuthThunks = mockEnv('~/app/store/auth/auth.thunks', mockMagicTrue).AuthThunks;
  const refreshSpy = jest
    // eslint-disable-next-line
    .spyOn(require('~/app/services/session').SessionService, 'refresh')
    .mockImplementation(async () => ({
      data: {
        auth_user_id: mockAuthUserID,
        auth_user_session_token: mockUST,
        email: mockEmail,
      },
    }));

  const stub0 = sandbox.stub(MockAuthThunks, 'populateUserCredentials');
  stub0.returns(dummyPromise);

  const result = await store.dispatch(MockAuthThunks.hydrateActiveUser({ from: 'cookies' }));

  const actions = store.getActions();
  expect(result).toBe(true);
  expect(stub0.calledWith()).toBe(true);
  expect(refreshSpy).toBeCalledWith();

  expect(actions).toEqual(hydrateActiveUserFromCookiesActions({ mockEmail, mockAuthUserID, mockUST }));
});

test('#21 hydrateActiveUser returns false if cannot hydrate from "cookies" or "storage"', async () => {
  const MockAuthThunks = mockEnv('~/app/store/auth/auth.thunks', mockMagicFalse).AuthThunks;

  const store = mockCoreStore(() => ({
    Auth: {
      userID: undefined,
      ust: undefined,
    },
  }));

  const stub0 = sandbox.stub(MockAuthThunks, 'populateUserCredentials');
  const stub1 = sandbox.stub(SessionService, 'refresh');
  const logoutStub = sandbox.stub(MockAuthThunks, 'logout');
  logoutStub.returns(dummyPromise);

  const result = await store.dispatch(MockAuthThunks.hydrateActiveUser());

  const actions = store.getActions();
  expect(result).toBe(false);
  expect(stub0.notCalled).toBe(true);
  expect(stub1.notCalled).toBe(true);
  expect(logoutStub.called).toBe(true);

  expect(actions).toEqual([]);
});

test('#22 hydrateActiveUser calls AuthThunks.logout if ServiceError#AUTH_USER_SESSION_EXPIRED is caught', async () => {
  const store = mockCoreStore(() => ({
    Auth: {
      userID: mockAuthUserID,
      ust: mockUST,
    },
  }));

  const stub0 = sandbox.stub(AuthThunks, 'populateUserCredentials');
  const stub1 = sandbox.stub(AuthThunks, 'logout');
  stub0.throws(createServiceError({ error_code: 'AUTH_USER_SESSION_EXPIRED', message: 'error' }));
  stub1.returns(dummyPromise);

  const result = await store.dispatch(AuthThunks.hydrateActiveUser());

  const actions = store.getActions();
  expect(result).toBe(false);
  expect(stub0.calledWith()).toBe(true);
  expect(stub1.calledWith()).toBe(true);

  expect(actions).toEqual([]);
});

test('#23 hydrateActiveUser catches errors and returns false', async () => {
  const store = mockCoreStore(() => ({
    Auth: {
      userID: mockAuthUserID,
      ust: mockUST,
    },
  }));

  const stub0 = sandbox.stub(AuthThunks, 'populateUserCredentials');
  const stub1 = sandbox.stub(AuthThunks, 'logout');
  stub0.throws('error');
  stub1.returns(dummyPromise);

  const result = await store.dispatch(AuthThunks.hydrateActiveUser());

  const actions = store.getActions();
  expect(result).toBe(false);
  expect(stub0.calledWith()).toBe(true);
  expect(stub1.called).toBe(true);

  expect(actions).toEqual([]);
});

test('#24 logout successsfully', async () => {
  const store = mockCoreStore({ Auth: { userId: '123' } });

  const stub0 = sandbox.stub(AuthenticationService, 'logout');

  stub0.returns(Promise.reject());

  await store.dispatch(AuthThunks.logout());

  const actions = store.getActions();

  expect(stub0.calledOnce).toBe(true);

  expect(actions).toEqual(logoutActions);
});

afterEach(() => {
  sandbox.restore();
});
