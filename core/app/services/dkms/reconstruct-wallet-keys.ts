import { WalletSecretManagementInfo } from '../../store/system/system.actions';
import { DelegatedWalletInfo } from '../../types/delegated-wallet-types';
import { SecretManagementStrategy } from '../../types/dkms-types';
import { UserKeys } from '~/app/store/auth/auth.reducer';
import { reconstructDkmsV3Secret, reconstructSplitKeySecret } from './decrypt-secret';
import { store } from '~/app/store';
import { AWSService } from '../aws';
import { setDeviceShare } from '~/app/store/auth/auth.actions';

// DH: We currently support 2 secret management strategies:
// [Shamir's secret sharing] for the "split key" strategy
//    For the Split key strategy there are 2 modes:
//     - 'Base' mode where Magic encrypts both keys
//     - 'Client Split' mode where a Client KMS encrypts one of the keys.
// [DKMSV3] refers to the "non-split" strategy, pre-key-splitting.
export const reconstructWalletPk = async (
  userKeys: UserKeys,
  walletType: string,
  walletSecretMangementInfo: WalletSecretManagementInfo,
  magicKmsInfo?: DelegatedWalletInfo,
  deviceShare?: string,
  systemClockOffset?: number,
  shouldHydrateDeviceShare = true,
) => {
  if (!magicKmsInfo) {
    throw new Error('No Magic KMS Info');
  }
  switch (walletSecretMangementInfo.strategy) {
    case SecretManagementStrategy.SHAMIRS_SECRET_SHARING: {
      const { secret, plaintextClientShare } = await reconstructSplitKeySecret(
        userKeys.authUserId,
        {
          MagicShare: userKeys.encryptedMagicPrivateAddressShare || '',
          ClientShare: userKeys.encryptedClientPrivateAddressShare || '',
          DeviceShare: deviceShare,
        },
        userKeys.encryptedClientPrivateAddressShareMetadata,
        walletType,
        walletSecretMangementInfo,
        magicKmsInfo,
        systemClockOffset,
      );

      // TODO: move this hydration flow out of this function.
      if (!store.getState().Auth.deviceShare && shouldHydrateDeviceShare) {
        // encrypt plaintextClientShare with magic KMS
        const newDeviceShare = await AWSService.kmsEncrypt(plaintextClientShare, magicKmsInfo, systemClockOffset);
        // populate global store with it
        store.dispatch(setDeviceShare(newDeviceShare));
      }
      return secret;
    }
    case SecretManagementStrategy.DKMSV3:
    default: {
      const secret = await reconstructDkmsV3Secret(
        userKeys.encryptedPrivateAddress || '',
        magicKmsInfo,
        systemClockOffset,
      );
      return secret;
    }
  }
};

export const reconstructWalletMnemonic = async (
  userKeys: UserKeys,
  walletType: string,
  walletSecretMangementInfo: WalletSecretManagementInfo,
  magicKmsInfo?: DelegatedWalletInfo,
  systemClockOffset?: number,
) => {
  if (!magicKmsInfo) {
    throw new Error('No Magic KMS Info');
  }
  switch (walletSecretMangementInfo.strategy) {
    case SecretManagementStrategy.SHAMIRS_SECRET_SHARING: {
      const { secret } = await reconstructSplitKeySecret(
        userKeys.authUserId,
        {
          MagicShare: userKeys.encryptedMagicSeedPhraseShare || '',
          ClientShare: userKeys.encryptedClientSeedPhraseShare || '',
        },
        userKeys.encryptedClientSeedPhraseShareMetadata,
        walletType,
        walletSecretMangementInfo,
        magicKmsInfo,
        systemClockOffset,
      );
      return secret;
    }
    case SecretManagementStrategy.DKMSV3:
    default: {
      const secret = await reconstructDkmsV3Secret(userKeys.encryptedSeedPhrase || '', magicKmsInfo, systemClockOffset);
      return secret;
    }
  }
};
