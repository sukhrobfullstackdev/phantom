import { EIP712TypedData, EIP712LegacyData } from 'eth-sig-util';
import { SignedTransaction, TransactionConfig } from 'web3-core';
import { JsonRpcRequestPayload } from 'magic-sdk';
import { Web3Service } from '../../services/web3';
import { DkmsService } from '~/app/services/dkms';
import { ThunkActionWrapper } from '../types';
import { DecentralizedIDTokenService } from '../../services/decentralized-id-token';
import { getWalletType, isETHWalletType, isMainnet } from '../../libs/network';
import { AuthenticationService } from '../../services/authentication';
import { WalletType } from '../../constants/flags';
import { cloneDeep, has } from '~/app/libs/lodash-utils';
import { parseCookies } from '~/app/libs/parse-cookies';
import { getSolanaLedgerBridge } from '~/app/libs/ledger';
import { standardizePayload } from '~/app/libs/web3-utils';
import { networksByChainId } from '~/features/connect-with-ui/hooks/chainInfoContext';

// Actions & Thunks
import { AuthThunks } from '../auth/auth.thunks';
import { getUserKeysFromUserInfo } from '~/app/libs/get-user-keys-from-user-info';

function signTypedDataV1ForUser(typedData: EIP712LegacyData): ThunkActionWrapper<Promise<string>> {
  return async (dispatch, getState) => {
    const { delegatedWalletInfo, userKeys, deviceShare } = getState().Auth;
    const { systemClockOffset, walletSecretMangementInfo } = getState().System;
    let key = await DkmsService.reconstructWalletPk(
      userKeys,
      getWalletType(),
      walletSecretMangementInfo,
      delegatedWalletInfo,
      deviceShare,
      systemClockOffset,
    );
    const signature = Web3Service.signTypedDataV1(typedData, key);

    // Mark the private key variable for garbage collection.
    (key as any) = null;

    return signature;
  };
}

function signTypedDataV3ForUser(typedData: EIP712TypedData): ThunkActionWrapper<Promise<string>> {
  return async (dispatch, getState) => {
    const { delegatedWalletInfo, userKeys, deviceShare } = getState().Auth;
    const { systemClockOffset, walletSecretMangementInfo } = getState().System;
    let key = await DkmsService.reconstructWalletPk(
      userKeys,
      getWalletType(),
      walletSecretMangementInfo,
      delegatedWalletInfo,
      deviceShare,
      systemClockOffset,
    );
    const signature = Web3Service.signTypedDataV3(typedData, key);

    // Mark the private key variable for garbage collection.
    (key as any) = null;

    return signature;
  };
}

function signTypedDataV4ForUser(typedData: EIP712TypedData): ThunkActionWrapper<Promise<string>> {
  return async (dispatch, getState) => {
    const { delegatedWalletInfo, userKeys, deviceShare } = getState().Auth;
    const { systemClockOffset, walletSecretMangementInfo } = getState().System;
    // eslint-disable-next-line prefer-const
    let key = await DkmsService.reconstructWalletPk(
      userKeys,
      getWalletType(),
      walletSecretMangementInfo,
      delegatedWalletInfo,
      deviceShare,
      systemClockOffset,
    );
    const signature = Web3Service.signTypedDataV4(typedData, key);

    // Mark the private key variable for garbage collection.
    (key as any) = null;

    return signature;
  };
}

function personalSignForUser(message: string): ThunkActionWrapper<Promise<string>> {
  return async (dispatch, getState) => {
    const { delegatedWalletInfo, userKeys, deviceShare } = getState().Auth;
    const { systemClockOffset, walletSecretMangementInfo } = getState().System;
    let key = await DkmsService.reconstructWalletPk(
      userKeys,
      getWalletType(),
      walletSecretMangementInfo,
      delegatedWalletInfo,
      deviceShare,
      systemClockOffset,
    );
    const signature = Web3Service.personalSign(message, key);

    // Mark the private key variable for garbage collection.
    (key as any) = null;

    return signature;
  };
}

function signTransactionForUser(tx: TransactionConfig): ThunkActionWrapper<Promise<SignedTransaction>> {
  return async (dispatch, getState) => {
    const { delegatedWalletInfo, userKeys, deviceShare } = getState().Auth;
    const { systemClockOffset, walletSecretMangementInfo } = getState().System;
    let key = await DkmsService.reconstructWalletPk(
      userKeys,
      getWalletType(),
      walletSecretMangementInfo,
      delegatedWalletInfo,
      deviceShare,
      systemClockOffset,
    );
    return Web3Service.signTransaction(tx, key).finally(() => {
      // Mark the private key variable for garbage collection.
      (key as any) = null;
    });
  };
}

function sendTransactionForUser(
  payload: JsonRpcRequestPayload,
): ThunkActionWrapper<Promise<string | null | undefined>> {
  return async (dispatch, getState) => {
    const { Auth } = getState();

    const chainId = (await Web3Service.getChainId()) as any;

    const chainIdNumber = Number(chainId) || 1;

    const network = networksByChainId[chainIdNumber];

    let standardizedPayload;

    if (network?.transactionFormat && has(standardizePayload, network?.transactionFormat)) {
      standardizedPayload = await standardizePayload[network.transactionFormat](
        cloneDeep(payload),
        chainIdNumber,
        Auth,
      );
    } else {
      standardizedPayload = await standardizePayload.Ethereum(cloneDeep(payload), chainIdNumber, Auth);
    }

    const { rawTransaction } = await dispatch(UserThunks.signTransactionForUser(standardizedPayload));

    return Web3Service.sendRawTransaction(rawTransaction);
  };
}

/**
 * Create a Decentralized ID Token (DIDT) for the user currently saved in
 * state.
 */
function createDIDTokenForUser(lifespan: number, attachment?: string): ThunkActionWrapper<Promise<string | null>> {
  return async (dispatch, getState) => {
    let privateKey: string | undefined | null = null;
    let account: { address: string; privateKey: string | undefined | null } | null = null;
    let audience: string;

    try {
      const { userID, userKeys, clientID, delegatedWalletInfo, deviceShare } = getState().Auth;
      const { systemClockOffset, walletSecretMangementInfo } = getState().System;

      if (
        userID &&
        userKeys.publicAddress &&
        (userKeys.encryptedPrivateAddress || userKeys.encryptedMagicPrivateAddressShare) &&
        clientID
      ) {
        if (isETHWalletType()) {
          privateKey = await DkmsService.reconstructWalletPk(
            userKeys,
            getWalletType(),
            walletSecretMangementInfo,
            delegatedWalletInfo,
            deviceShare,
            systemClockOffset,
          );
          account = { privateKey, address: userKeys.publicAddress };
          audience = clientID;
        } else {
          const userInfo = (await AuthenticationService.getUserInfo(userID, WalletType.ETH)).data;
          privateKey = await DkmsService.reconstructWalletPk(
            getUserKeysFromUserInfo(userInfo),
            WalletType.ETH,
            walletSecretMangementInfo,
            delegatedWalletInfo,
            '', // do not use the device share for multi-chain did token signing as this will always use eth.
            systemClockOffset,
            false,
          );
          account = { privateKey, address: userInfo.public_address };
          audience = userInfo.client_id;
        }

        return DecentralizedIDTokenService.createToken({
          account: account as any,
          subject: userID,
          audience,
          lifespan,
          attachment,
          systemClockOffset: getState().System.systemClockOffset,
        });
      }
      return null;
    } catch (e) {
      await dispatch(AuthThunks.logout());
      return null;
    } finally {
      // Explicitly mark sensitive variables for garbage collection.
      account = null;
      privateKey = null;
    }
  };
}

/**
 * Create a Decentralized ID Token (DIDT) encoded with an encrypted OAuth access
 * token as the "attachment".
 */
function createOAuthMagicCredentialForUser(
  attachment: string = parseCookies()._oaclientmeta?.encrypted_access_token || '',
): ThunkActionWrapper<Promise<string | null>> {
  return async (dispatch, getState) => {
    const lifespan = 15 * 60; // 15 minutes in seconds

    if (attachment) {
      return dispatch(UserThunks.createDIDTokenForUser(lifespan, attachment));
    }

    return null;
  };
}

export enum CredentialType {
  PrivateKey = 'private_key',
  SeedPhrase = 'seed_phrase',
}

function getPKOrSPForUser(type = CredentialType.PrivateKey): ThunkActionWrapper<Promise<string | null>> {
  return async (dispatch, getState) => {
    try {
      const { userID, delegatedWalletInfo, userKeys, deviceShare } = getState().Auth;
      const { systemClockOffset, walletSecretMangementInfo } = getState().System;
      if (isMainnet()) await AuthenticationService.trackRevealWallet(userID);
      const hasSeedPhrase = userKeys.encryptedSeedPhrase || userKeys.encryptedMagicSeedPhraseShare;
      if (type === CredentialType.SeedPhrase && hasSeedPhrase) {
        const sp = await DkmsService.reconstructWalletMnemonic(
          userKeys,
          getWalletType(),
          walletSecretMangementInfo,
          delegatedWalletInfo,
          systemClockOffset,
        );
        return sp;
      }
      const pk = await DkmsService.reconstructWalletPk(
        userKeys,
        getWalletType(),
        walletSecretMangementInfo,
        delegatedWalletInfo,
        deviceShare,
        systemClockOffset,
      );
      return pk;
    } catch (e) {
      await dispatch(AuthThunks.logout());
      return 'failed';
    }
  };
}

function getPKOrSPForUserInLedger(
  payload: JsonRpcRequestPayload,
  type = CredentialType.PrivateKey,
): ThunkActionWrapper<Promise<string | null>> {
  return async (dispatch, getState) => {
    try {
      const { userID, deviceShare } = getState().Auth;
      const walletType = getWalletType();
      if (isMainnet()) await AuthenticationService.trackRevealWallet(userID);
      const userInfo = (await AuthenticationService.getUserInfo(userID, walletType)).data;
      const userKeys = getUserKeysFromUserInfo(userInfo);

      const { delegatedWalletInfo } = getState().Auth;
      const { systemClockOffset, walletSecretMangementInfo } = getState().System;
      const hasSeedPhrase = userKeys.encryptedSeedPhrase || userKeys.encryptedMagicSeedPhraseShare;

      let pk = '';

      if (type === CredentialType.SeedPhrase && hasSeedPhrase) {
        pk = await DkmsService.reconstructWalletMnemonic(
          userKeys,
          getWalletType(),
          walletSecretMangementInfo,
          delegatedWalletInfo,
          systemClockOffset,
        );
        payload.params[0] = pk;
      } else {
        pk = await DkmsService.reconstructWalletPk(
          userKeys,
          getWalletType(),
          walletSecretMangementInfo,
          delegatedWalletInfo,
          deviceShare,
          systemClockOffset,
        );
        payload.params[0] = pk;
      }

      if (getWalletType() === WalletType.SOLANA) {
        const solanaBridge = await getSolanaLedgerBridge();
        payload.params[0] = await solanaBridge.convertMnemonicToRawPrivateKey(payload, pk);
      }

      const res = payload.params[0];
      return res;
    } catch (e) {
      await dispatch(AuthThunks.logout());
      return 'failed';
    }
  };
}

/**
 * Export module to stub local function stub for testing purpose
 */
export const UserThunks = {
  personalSignForUser,
  signTypedDataV4ForUser,
  signTypedDataV3ForUser,
  signTypedDataV1ForUser,
  sendTransactionForUser,
  signTransactionForUser,
  createDIDTokenForUser,
  createOAuthMagicCredentialForUser,
  getPKOrSPForUser,
  getPKOrSPForUserInLedger,
};
