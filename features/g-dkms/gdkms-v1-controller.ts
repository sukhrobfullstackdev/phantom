import { RpcMiddleware } from '~/app/rpc/types';
import { DkmsService } from '~/app/services/dkms';
import { SystemThunks } from '~/app/store/system/system.thunks';
import { AES, HAS_SUBTLE_CRYPTO } from '~/app/libs/crypto';
import { createHashNative } from '~/features/g-dkms/utils/hash';
import { sdkErrorFactories } from '~/app/libs/exceptions';
import { getWalletType } from '~/app/libs/network';

type encryptParams = [{ message: string }];
type decryptParams = [{ ciphertext: string }];
type encryptContext = {};
type encryptV1Middleware = RpcMiddleware<encryptParams, encryptContext>;
type decryptV1Middleware = RpcMiddleware<decryptParams, encryptContext>;

export const browserEnvironmentCheck = async (ctx, next) => {
  if (window.isSecureContext && !HAS_SUBTLE_CRYPTO) {
    throw sdkErrorFactories.client.insecureEnvironment();
  }
  next();
};

export const marshallEncryptV1Params: encryptV1Middleware = async (ctx, next) => {
  const { payload, getState, dispatch } = ctx;
  const message = payload.params?.[0]?.message;
  const { delegatedWalletInfo, userKeys, deviceShare } = getState().Auth;
  const { systemClockOffset, walletSecretMangementInfo } = getState().System;
  let pk: null | string = await DkmsService.reconstructWalletPk(
    userKeys,
    getWalletType(),
    walletSecretMangementInfo,
    delegatedWalletInfo,
    deviceShare,
    systemClockOffset,
  );

  // Hash the pk to avoid passing plaintext pk
  const hash = await createHashNative(pk);
  pk = null;
  const ciphertext = AES.encrypt(message as string, hash);
  await dispatch(SystemThunks.resolveJsonRpcResponse({ payload, result: ciphertext }));
};

export const marshallDecryptV1Params: decryptV1Middleware = async (ctx, next) => {
  const { payload, getState, dispatch } = ctx;
  const cipherText = payload.params?.[0]?.ciphertext;
  const { delegatedWalletInfo, userKeys, deviceShare } = getState().Auth;
  const { systemClockOffset, walletSecretMangementInfo } = getState().System;
  let pk: null | string = await DkmsService.reconstructWalletPk(
    userKeys,
    getWalletType(),
    walletSecretMangementInfo,
    delegatedWalletInfo,
    deviceShare,
    systemClockOffset,
  );

  // Hash the pk to avoid passing plaintext pk to third-party library
  const hash = await createHashNative(pk);
  pk = null;
  const originalMessage = AES.decrypt(cipherText as string, hash);

  await dispatch(SystemThunks.resolveJsonRpcResponse({ payload, result: originalMessage }));
};
