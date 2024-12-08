import { has } from '~/app/libs/lodash-utils';
import { transformCredentialCreateOptions, transformCredentialRequestOptions } from '~/app/libs/webauthn';

test('transformCredentialCreateOptions success', async () => {
  const mockOptions = {
    attestation: 'direct',
    challenge: 'lT8OQ92zJTsd6EBm48OtrgVH9UQH0tBc70HgBxiPkTg',
    excludeCredentials: [],
    extensions: {
      'webauthn.loc': true,
    },
    pubKeyCredParams: [
      {
        alg: -7,
        type: 'public-key',
      },
      {
        alg: -257,
        type: 'public-key',
      },
      {
        alg: -37,
        type: 'public-key',
      },
    ],
    rp: {
      id: 'localhost',
      name: null,
    },
    timeout: 60000,
    user: {
      displayName: null,
      id: 'F27gi8e05hxDAl6-QxTQC5EAAGx-I1lWQmOsimim1mU=',
      name: 'harry13',
    },
  };

  const result = await transformCredentialCreateOptions(mockOptions);

  expect(result.attestation).toEqual('direct');
  expect(result.timeout).toEqual(60000);
  expect(has(result, 'challenge')).toBe(true);
  expect(has(result, 'extensions')).toBe(true);
  expect(has(result, 'pubKeyCredParams')).toBe(true);
  expect(has(result, 'rp')).toBe(true);
  expect(has(result, 'user')).toBe(true);
  expect(has(result, 'excludeCredentials')).toBe(true);
});

test('transformCredentialRequestOptions success', async () => {
  const mockOptions = {
    allowCredentials: [
      {
        id: 'AdotjUgqvV1BvOAEF7MopRwGDWfmexgYpMHfHTrVaCDDL9R7QrfBWj2T4oudKGbHlqoGHKjBLk32_I5b74yxRdeWZ_KVBLsipD8AXABK',
        transports: ['usb', 'nfc', 'ble', 'internal'],
        type: 'public-key',
      },
    ],
    challenge: '66hFJtoRFWgGvHz1aczPF1r0e90oqa_gnC-JoupvbLY',
    rpId: 'localhost',
    timeout: 60000,
    userVerification: 'discouraged',
  };
  const result = await transformCredentialRequestOptions(mockOptions);

  expect(result.rpId).toEqual('localhost');
  expect(result.timeout).toEqual(60000);
  expect(result.userVerification).toEqual('discouraged');
  expect(has(result, 'allowCredentials')).toBe(true);
  expect(has(result, 'challenge')).toBe(true);
});
