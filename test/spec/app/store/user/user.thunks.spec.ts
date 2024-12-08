import sinon from 'sinon';
import { cloneDeep } from '~/app/libs/lodash-utils';

import { UserThunks } from '~/app/store/user/user.thunks';
import { mockCoreStore } from '../../../_utils/mockStore';
import { stubIsETHWalletType } from '~/test/spec/_utils/stubs';
import {
  signTypedDataV1Payload,
  signTypedDataV3Payload,
  signTypedDataV4Payload,
} from '~/test/data/sign-typed-data-payloads';
import { AWSService } from '~/app/services/aws';
import { dummyPromise } from '~/test/spec/_utils/dummy-promise';
import { AuthenticationService } from '~/app/services/authentication';
import { WalletType } from '~/app/constants/flags';
import { DecentralizedIDTokenService } from '~/app/services/decentralized-id-token';
import { Web3Service } from '~/app/services/web3';
import { ETH_SENDTRANSACTION } from '~/app/constants/eth-rpc-methods';
import { SecretManagementStrategy } from '~/app/types/dkms-types';
import { DkmsService } from '~/app/services/dkms';

let sandbox;

const publicAddress = '0x3750B8eF5AB747D986B935d6316d7E76059dD4Ee';
const encrypted_private_address = 'mock encryptedPrivateAddress';
const client_id = 'client_id';

const mockRawPrivateKey = '0x13d76043e5771a944cbad9092d1d009e078dd8dd05cd4318953327a5a52d683b';

const mockGetUserInfoResult = {
  data: {
    public_address: publicAddress,
    encrypted_private_address,
    client_id,
  },
};
const mockDIDToken = 'mock did token';
const mockLifespan = 50000;
const mockAttachment = 'mock attachment';
const mockJsonRpcRequestPayloadExportPrivateKey = {
  jsonrpc: '2.0',
  id: 1,
  method: 'magic_export_private_key',
  params: [],
};

const mockTransactionPayload = {
  jsonrpc: '2.0',
  id: 1,
  method: ETH_SENDTRANSACTION,
  params: [
    {
      from: '0x01568bf1c1699bb9d58fac67f3a487b28ab4ab2d',
      to: '0x01568bf1c1699bb9d58fac67f3a487b28ab4ab2d',
      value: 100000000000,
    },
  ],
};

const initState = {
  Auth: {
    userKeys: {
      encryptedPrivateAddress: encrypted_private_address,
      publicAddress,
    },
    userEmail: 'mockEmail@magic.link',
    userID: 'test user id',
    clientID: client_id,
    delegatedWalletInfo: {},
  },
  System: {
    isJsonRpcMessageChannelOpen: false,
    isThemePreviewMessageChannelOpen: false,
    isOverlayShowing: false,
    showUI: false,
    systemClockOffset: 0,
    walletSecretManagementInfo: {
      strategy: SecretManagementStrategy.DKMSV3,
    },
  },
};

beforeEach(() => {
  sandbox = sinon.createSandbox();
  sandbox.stub(DkmsService, 'reconstructWalletPk').returns(mockRawPrivateKey);
});

test('#1 signTypedDataV1ForUser success', async () => {
  const store = mockCoreStore(initState);

  const result = await store.dispatch(UserThunks.signTypedDataV1ForUser(signTypedDataV1Payload));

  expect(result).toEqual(
    '0xa523b9a73265afa6bf914d415318cf1483bf099ad3354f29c9e722b62787b0480e52' +
      '4040662c5ed0486050022b0457a6c9331e4ad0c756a116ba0dfb52c9d6ab1b',
  );
});

test('#2 signTypedDataV3ForUser success', async () => {
  const store = mockCoreStore(initState);

  const result = await store.dispatch(UserThunks.signTypedDataV3ForUser(signTypedDataV3Payload));

  expect(result).toEqual(
    '0x43670c0e83bf5396ad49538f8c342e0c0ab308607158b7a4bf11975e210d915e7bf2668ddc3d2b9' +
      'dfdc23b231c0ae6c20fa32ee4cf23eb77fde1fde22b5d92c01c',
  );
});

test('#3 signTypedDataV4ForUser success', async () => {
  const store = mockCoreStore(initState);

  const result = await store.dispatch(UserThunks.signTypedDataV4ForUser(signTypedDataV4Payload));

  expect(result).toEqual(
    '0x3b0c0b4a53232ff08ac3942c0f296e7f6f4ed2bbe0d89dffe6fa651793f68cfd6ff0b0182aac029' +
      '23dd24496cc4b5f8aaecb4de6ecc9980885d032b83b2a63de1b',
  );
});

test('#4 personalSignForUser success', async () => {
  const store = mockCoreStore(initState);

  const result = await store.dispatch(UserThunks.personalSignForUser('troll goat'));

  expect(result).toEqual(
    '0x6f1236acee59ac5c990a97e2f6eca1542d938d456c560ee8dd398018da5620aa41506875243b179' +
      '7e279c30acbecf4988f042ab6c3afa3ba39908b453562c4741b',
  );
});

test('#9 createDIDTokenForUser with not eth wallet type success', async () => {
  const store = mockCoreStore(initState);

  stubIsETHWalletType(false);
  const stub0 = sandbox.stub(AuthenticationService, 'getUserInfo');
  stub0.returns(mockGetUserInfoResult);

  const stub1 = sandbox.stub(DecentralizedIDTokenService, 'createToken');
  stub1.returns(mockDIDToken);

  const result = await store.dispatch(UserThunks.createDIDTokenForUser(mockLifespan, mockAttachment));

  expect(result).toEqual(mockDIDToken);
  expect(stub0.calledWith(initState.Auth.userID, WalletType.ETH)).toBe(true);
  expect(
    stub1.calledWith({
      account: { privateKey: mockRawPrivateKey, address: publicAddress },
      subject: initState.Auth.userID,
      audience: client_id,
      lifespan: mockLifespan,
      attachment: mockAttachment,
      systemClockOffset: initState.System.systemClockOffset,
    }),
  ).toBe(true);
});

test('# 10 createDIDTokenForUser with eth wallet type success', async () => {
  const store = mockCoreStore(initState);
  const stub1 = sandbox.stub(DecentralizedIDTokenService, 'createToken');
  stub1.returns(mockDIDToken);
  stubIsETHWalletType(true);

  const result = await store.dispatch(UserThunks.createDIDTokenForUser(mockLifespan, mockAttachment));

  expect(result).toEqual(mockDIDToken);
  expect(
    stub1.calledWith({
      account: { privateKey: mockRawPrivateKey, address: publicAddress },
      subject: initState.Auth.userID,
      audience: client_id,
      lifespan: mockLifespan,
      attachment: mockAttachment,
      systemClockOffset: initState.System.systemClockOffset,
    }),
  ).toBe(true);
});

const varList = ['userID', 'publicAddress', 'encryptedPrivateAddress', 'clientID'];
// const varList = ['userID', 'publicAddress', 'encryptedPrivateAddress'];

varList.forEach(item => {
  test(`createDIDTokenForUser returns null with ${item} is null`, async () => {
    const state = cloneDeep(initState);
    // @ts-expect-error
    if (item === 'userID') state.Auth.userID = null;
    // @ts-expect-error
    if (item === 'clientID') state.Auth.clientID = null;
    // @ts-expect-error
    if (item === 'publicAddress') state.Auth.userKeys.publicAddress = null;
    // @ts-expect-error
    if (item === 'encryptedPrivateAddress') state.Auth.userKeys.encryptedPrivateAddress = null;

    const store = mockCoreStore(state);

    const result = await store.dispatch(UserThunks.createDIDTokenForUser(mockLifespan, mockAttachment));

    expect(result).toEqual(null);
  });
});

test('createDIDTokenForUser with error then calls logout', async () => {
  const store = mockCoreStore(initState);
  stubIsETHWalletType(false);

  sandbox.stub(AuthenticationService, 'getUserInfo').throws(new Error('Throws error!'));

  const result = await store.dispatch(UserThunks.createDIDTokenForUser(mockLifespan, mockAttachment));

  expect(result).toEqual(null);
});

test('createOAuthMagicCredentialForUser without attachment returns null', async () => {
  const store = mockCoreStore(initState);

  const result = await store.dispatch(UserThunks.createOAuthMagicCredentialForUser(''));

  expect(result).toEqual(null);
});

test('createOAuthMagicCredentialForUser with attachment returns createDIDTokenForUser result', async () => {
  const state = cloneDeep(initState);
  // @ts-expect-error
  state.Auth.userID = null;
  const store = mockCoreStore(state);

  const result = await store.dispatch(UserThunks.createOAuthMagicCredentialForUser(mockAttachment));

  expect(result).toEqual(null);
});

test('getPKOrSPForUser throws error return failed', async () => {
  const store = mockCoreStore(initState);
  sandbox.stub(AuthenticationService, 'trackRevealWallet').throws(new Error('Throws error!'));

  const result = await store.dispatch(UserThunks.getPKOrSPForUser());

  expect(result).toEqual('failed');
});

test('getPKOrSPForUser success', async () => {
  const store = mockCoreStore(initState);
  const stub0 = sandbox.stub(AuthenticationService, 'trackRevealWallet');
  stub0.returns(dummyPromise);

  const result = await store.dispatch(UserThunks.getPKOrSPForUser());

  expect(result).toEqual(mockRawPrivateKey);
  expect(stub0.calledWith(initState.Auth.userID)).toBe(true);

  const resultPayload = cloneDeep(mockJsonRpcRequestPayloadExportPrivateKey);
  // @ts-expect-error
  resultPayload.params[0] = mockRawPrivateKey;

  const actions = store.getActions();
  expect(actions).toEqual([]);
});

test('#5 sendTransactionForUser success', async () => {
  const store = mockCoreStore(initState);
  const tx = {};

  const stub0 = sandbox.stub(Web3Service, 'signTransaction').resolves(dummyPromise);

  await store.dispatch(UserThunks.signTransactionForUser(tx));

  expect(stub0.calledOnceWith(tx, mockRawPrivateKey)).toBe(true);
});

test('sendTransactionForUser success', async () => {
  const store = mockCoreStore(initState);

  const stub0 = sandbox.stub(Web3Service, 'getChainId');
  stub0.returns(1);

  const stub1 = sandbox.stub(Web3Service, 'estimateGas');
  stub1.returns(91000);

  const stub2 = sandbox.stub(Web3Service, 'getGasPrice');
  stub2.returns(10000);

  const stub3 = sandbox.stub(Web3Service, 'getTransactionCount');
  stub3.returns(1);

  const stub5 = sandbox.stub(Web3Service, 'sendRawTransaction');
  stub5.returns(dummyPromise);

  await store.dispatch(UserThunks.sendTransactionForUser(mockTransactionPayload));

  expect(stub0.calledOnce).toBe(true);
  expect(stub1.calledOnce).toBe(true);
  expect(stub2.calledOnce).toBe(true);
  expect(stub3.calledOnceWith(publicAddress)).toBe(true);
  expect(
    stub5.calledOnceWith(
      '0xf86701822710830163789401568bf1c1699bb9d58fac67f3a487b28ab4ab2d8517487' +
        '6e8008025a0f501c443bdcaad6188eb0a4428941e5ff1a51b9973b9f7f4a2dbab4db087a5d9a05116b464e2ba6565c640bc2' +
        '39b5f47a472671f812a8f94863f7a5b1965fab909',
    ),
  ).toBe(true);
});

afterEach(() => {
  sandbox.restore();
});
