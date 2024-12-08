import { AWSService } from '../aws';
import { DelegatedWalletInfo } from '../../types/delegated-wallet-types';
import * as sss from '@magiclabs/shamirs-secret-sharing';
import { base64BinaryToUint8Array } from '../../libs/decode-uint-array';
import { EncryptedSecretShares, SplitkeyMode } from '../../types/dkms-types';
import { getJwt } from './get-jwt';
import { clientKmsDecrypt, DEFAULT_CLIENT_KMS_DECRYPT_URL } from './client-kms';
import { WalletSecretManagementInfo } from '~/app/store/system/system.actions';

export const reconstructSplitKeySecret = async (
  authUserId: string,
  encryptedSecretShares: EncryptedSecretShares,
  clientShareMetadata: object | undefined,
  walletType: string,
  walletSecretMangementInfo: WalletSecretManagementInfo,
  magicKmsInfo: DelegatedWalletInfo,
  systemClockOffset?: number,
): Promise<{ secret: string; plaintextClientShare: string }> => {
  if (!encryptedSecretShares?.MagicShare) {
    throw new Error('No Encrypted Magic Share provided');
  }

  // Recover the Magic share
  const plaintextMagicShare = await AWSService.kmsDecrypt(
    encryptedSecretShares.MagicShare,
    magicKmsInfo,
    systemClockOffset,
  );

  // Recover the client share
  let plaintextClientShare = '';

  if (encryptedSecretShares.DeviceShare) {
    plaintextClientShare = await AWSService.kmsDecrypt(
      encryptedSecretShares.DeviceShare,
      magicKmsInfo,
      systemClockOffset,
    );
  } else {
    // base split key client share recovery
    if (!encryptedSecretShares.ClientShare) {
      throw new Error('No Encrypted Client Share provided');
    }
    // client-split key client share recovery
    switch (walletSecretMangementInfo?.definition?.mode) {
      case SplitkeyMode.CLIENT_SPLIT: {
        const jwt = (await getJwt(authUserId, walletType, clientShareMetadata)).data.token as string;
        plaintextClientShare = await clientKmsDecrypt(
          encryptedSecretShares.ClientShare,
          walletSecretMangementInfo?.definition?.decryption_endpoint || DEFAULT_CLIENT_KMS_DECRYPT_URL,
          jwt,
        );
        break;
      }
      case SplitkeyMode.BASE:
      default: {
        plaintextClientShare = await AWSService.kmsDecrypt(
          encryptedSecretShares.ClientShare,
          magicKmsInfo,
          systemClockOffset,
        );
      }
    }
  }

  // Finally, recombine plaintext shares using SSS.
  // Also return the plaintextClientShare for re-encrypting the device share
  const reconstructedUint8Array = sss.combine([
    Buffer.from(base64BinaryToUint8Array(plaintextMagicShare)),
    Buffer.from(base64BinaryToUint8Array(plaintextClientShare)),
  ]);
  return { secret: reconstructedUint8Array.toString(), plaintextClientShare };
};

export const reconstructDkmsV3Secret = async (
  fullEncryptedSecret: string,
  magicKmsInfo: DelegatedWalletInfo,
  systemClockOffset?: number,
): Promise<string> => {
  if (!fullEncryptedSecret) {
    throw new Error('No encrypted secret provided');
  }
  const secret = await AWSService.kmsDecrypt(fullEncryptedSecret, magicKmsInfo, systemClockOffset);
  return secret;
};
