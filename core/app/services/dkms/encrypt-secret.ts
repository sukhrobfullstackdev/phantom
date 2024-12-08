import { AWSService } from '../aws';
import * as sss from '@magiclabs/shamirs-secret-sharing';
import { uint8ArrayToBase64 } from '../../libs/decode-uint-array';
import { EncryptedSecretShares, PlaintextSecretShares, SplitkeyMode } from '../../types/dkms-types';
import { getJwt } from './get-jwt';
import { clientKmsEncrypt, DEFAULT_CLIENT_KMS_ENCRYPT_URL } from './client-kms';
import { DkmsV3KeyData, SplitKeyData } from './encrypt-and-sync-wallet';

// In accordance with DKMS V4 (Split key) spec
// The secret we manage will be split into 3 shares with sss
// with a threshold of 2 shares.
const splitDataInto3Shares = (data: string): PlaintextSecretShares => {
  const secret = Buffer.from(data);
  const shares = sss.split(secret, { shares: 3, threshold: 2 });
  const MagicShare = uint8ArrayToBase64(shares[0] as Uint8Array);
  const ClientShare = uint8ArrayToBase64(shares[1] as Uint8Array);
  const RecoveryShare = uint8ArrayToBase64(shares[2] as Uint8Array);
  return { MagicShare, ClientShare, RecoveryShare };
};

export const encryptDkmsV3KeySecret = async (dkmsV3KeyData: DkmsV3KeyData, secret: string) => {
  const encryptedSecret = await AWSService.kmsEncrypt(
    secret,
    dkmsV3KeyData.magicKmsInfo,
    dkmsV3KeyData.systemClockOffset,
  );
  return encryptedSecret;
};

export const encryptSplitKeySecret = async (
  splitKeyData: SplitKeyData,
  secret: string,
): Promise<EncryptedSecretShares> => {
  const plaintextShares = splitDataInto3Shares(secret);
  let encryptedClientShare = '';
  const magicEncryptedMagicSharePromise = AWSService.kmsEncrypt(
    plaintextShares.MagicShare,
    splitKeyData.magicKmsInfo,
    splitKeyData.systemClockOffset,
  );

  // For Device Share + Split Key Base Mode
  const magicEncryptedClientSharePromise = AWSService.kmsEncrypt(
    plaintextShares.ClientShare,
    splitKeyData.magicKmsInfo,
    splitKeyData.systemClockOffset,
  );

  const [encryptedMagicShare, magicEncryptedClientShare] = await Promise.all([
    magicEncryptedMagicSharePromise,
    magicEncryptedClientSharePromise,
  ]);

  switch (splitKeyData.walletSecretManagementInfo.definition?.mode) {
    case SplitkeyMode.CLIENT_SPLIT: {
      const jwt = (await getJwt(splitKeyData.userID, splitKeyData.walletType, splitKeyData.clientShareMetadata)).data
        .token as string;
      encryptedClientShare = await clientKmsEncrypt(
        plaintextShares.ClientShare,
        splitKeyData.walletSecretManagementInfo?.definition?.encryption_endpoint || DEFAULT_CLIENT_KMS_ENCRYPT_URL,
        jwt,
      );
      break;
    }
    case SplitkeyMode.BASE:
    default: {
      encryptedClientShare = magicEncryptedClientShare;
    }
  }
  return { MagicShare: encryptedMagicShare, ClientShare: encryptedClientShare, DeviceShare: magicEncryptedClientShare };
};
