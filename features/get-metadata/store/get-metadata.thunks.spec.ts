import sinon from 'sinon';

import { injectedDeps } from './get-metadata.thunks';

const publicAddress = 'wat';
const userId = 'i am user beep boop';
const authState = {
  userKeys: {
    publicAddress,
  },
  userId,
};
const mockGetUserInfoResult = {
  data: {
    public_address: publicAddress,
  },
};

test('when user meta data is requested with an eth wallet type and no user email', async () => {
  const expectedIssuer = `did:ethr:${userId}`;
  const dispatchMock = sinon.spy();
  const getStateMock = () => ({
    Auth: {
      ...authState,
    },
  });
  const authServiceMock = {
    getUser: sinon.spy(() => mockGetUserInfoResult),
  };
  const isEthWallet = () => true;
  const generateUserId = () => expectedIssuer;
  const thunk = injectedDeps(authServiceMock as any, isEthWallet, generateUserId)();

  const result = await thunk(dispatchMock, getStateMock as any);

  expect(result).toEqual({
    email: null,
    phoneNumber: null,
    isMfaEnabled: false,
    issuer: expectedIssuer,
    publicAddress,
  });
  expect(authServiceMock.getUser.calledOnce).toBe(true);
  expect(dispatchMock.calledOnce).toBe(false);
});

test('when user meta data is requested with an eth wallet type and user phone number', async () => {
  const expectedIssuer = `did:ethr:${userId}`;
  const expectedPhone = '+1231231233';
  const dispatchMock = sinon.spy();
  const getStateMock = () => ({
    Auth: {
      ...authState,
      userPhoneNumber: expectedPhone,
    },
  });
  const authServiceMock = {
    getUser: sinon.spy(() => mockGetUserInfoResult),
  };
  const isEthWallet = () => true;
  const generateUserId = () => expectedIssuer;
  const thunk = injectedDeps(authServiceMock as any, isEthWallet, generateUserId)();

  const result = await thunk(dispatchMock, getStateMock as any);

  expect(result).toEqual({
    email: null,
    isMfaEnabled: false,
    phoneNumber: expectedPhone,
    issuer: expectedIssuer,
    publicAddress,
  });
  expect(authServiceMock.getUser.calledOnce).toBe(true);
  expect(dispatchMock.calledOnce).toBe(false);
});

test('when user meta data is requested with an eth wallet type and has a user email', async () => {
  const expectedIssuer = `did:ethr:${userId}`;
  const expectedUserEmail = 'apple@bees.delicious';
  const dispatchMock = sinon.spy();
  const getStateMock = () => ({
    Auth: {
      ...authState,
      userEmail: expectedUserEmail,
    },
  });
  const authServiceMock = {
    getUser: sinon.spy(() => mockGetUserInfoResult),
  };
  const isEthWallet = () => true;
  const generateUserId = () => expectedIssuer;
  const thunk = injectedDeps(authServiceMock as any, isEthWallet, generateUserId)();

  const result = await thunk(dispatchMock, getStateMock as any);

  expect(result).toEqual({
    email: expectedUserEmail,
    phoneNumber: null,
    isMfaEnabled: false,
    issuer: expectedIssuer,
    publicAddress,
  });
  expect(authServiceMock.getUser.calledOnce).toBe(true);
  expect(dispatchMock.calledOnce).toBe(false);
});

test('when user meta data is requested without an eth wallet type', async () => {
  const expectedIssuer = `did:ethr:${userId}`;
  const expectedUserEmail = 'apple@bees.delicious';
  const dispatchMock = sinon.spy();
  const getStateMock = () => ({
    Auth: {
      ...authState,
      userEmail: expectedUserEmail,
    },
  });
  const authServiceMock = {
    getUser: sinon.spy(() => mockGetUserInfoResult),
  };
  const isEthWallet = () => false;
  const generateUserId = () => expectedIssuer;
  const thunk = injectedDeps(authServiceMock as any, isEthWallet, generateUserId)();

  const result = await thunk(dispatchMock, getStateMock as any);

  expect(result).toEqual({
    email: expectedUserEmail,
    isMfaEnabled: false,
    phoneNumber: null,
    issuer: expectedIssuer,
    publicAddress,
  });
  expect(authServiceMock.getUser.calledOnce).toBe(true);
  expect(dispatchMock.calledOnce).toBe(false);
});

test('when user meta data is requested without an eth wallet type and no public address', async () => {
  const expectedIssuer = null;
  const expectedUserEmail = 'apple@bees.delicious';
  const dispatchMock = sinon.spy();
  const getStateMock = () => ({
    Auth: {
      userKeys: {
        publicAddress: null,
      },
      userEmail: expectedUserEmail,
    },
  });
  const authServiceMock = {
    getUser: sinon.spy(() => mockGetUserInfoResult),
  };
  const isEthWallet = () => false;

  const thunk = injectedDeps(authServiceMock as any, isEthWallet)();

  const result = await thunk(dispatchMock, getStateMock as any);

  expect(result).toEqual({
    email: expectedUserEmail,
    phoneNumber: null,
    isMfaEnabled: false,
    issuer: expectedIssuer,
    publicAddress: null,
  });
  expect(authServiceMock.getUser.calledOnce).toBe(true);
  expect(dispatchMock.calledOnce).toBe(false);
});

test('when user meta data is requested and auth service fails', async () => {
  const dispatchMock = sinon.spy();
  const getStateMock = () => ({
    Auth: {
      ...authState,
    },
  });
  const authServiceMock = {
    getUser: sinon.spy(async () => Promise.reject()),
  };
  const isEthWallet = () => false;
  const generateUserId = sinon.spy();
  const thunk = injectedDeps(authServiceMock as any, isEthWallet)();

  try {
    await thunk(dispatchMock, getStateMock as any, generateUserId as any);
  } catch (e) {
    expect(e === undefined).toBe(true);
  } finally {
    expect(authServiceMock.getUser.calledOnce).toBe(true);
    expect(dispatchMock.calledOnce).toBe(false);
    expect(generateUserId.calledOnce).toBe(false);
  }
});
