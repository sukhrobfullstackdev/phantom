import { HDWalletPath } from '../../constants/ledger-support';
import { AuthenticationService } from '../authentication';
import { v4 as createUuid } from 'uuid';
import { WalletSecretManagementInfo } from '../../store/system/system.actions';
import { DelegatedWalletInfo } from '../../types/delegated-wallet-types';
import { EncryptedSecretShares, SecretManagementStrategy } from '../../types/dkms-types';
import { encryptDkmsV3KeySecret, encryptSplitKeySecret } from './encrypt-secret';
import { UserKeys } from '~/app/store/auth/auth.reducer';

export interface SplitKeyData {
  userID: string;
  clientShareMetadata: object;
  walletSecretManagementInfo: WalletSecretManagementInfo;
  walletType: string;
  systemClockOffset: number;
  magicKmsInfo: DelegatedWalletInfo;
}

export interface DkmsV3KeyData {
  magicKmsInfo: DelegatedWalletInfo;
  systemClockOffset: number;
}

export const encryptAndSyncWallet = async (
  walletSecretManagementInfo: WalletSecretManagementInfo,
  wallet: any,
  magicKmsInfo: DelegatedWalletInfo,
  userID: string,
  walletType: string,
  systemClockOffset: number,
): Promise<UserKeys> => {
  let fullEncryptedPrivateKey = '';
  let fullEncryptedMnemonic = '';

  let encryptedPkShares = {
    MagicShare: '',
    ClientShare: '',
  } as EncryptedSecretShares;

  let encryptedMnemonicShares = {
    MagicShare: '',
    ClientShare: '',
  } as EncryptedSecretShares;

  const clientShareMetadata = { ewi: createUuid() };

  switch (walletSecretManagementInfo?.strategy) {
    case SecretManagementStrategy.SHAMIRS_SECRET_SHARING: {
      const splitKeyData: SplitKeyData = {
        userID,
        clientShareMetadata,
        walletSecretManagementInfo,
        magicKmsInfo,
        walletType,
        systemClockOffset,
      };
      encryptedPkShares = await encryptSplitKeySecret(splitKeyData, wallet.privateKey as string);
      if (wallet.mnemonic) {
        encryptedMnemonicShares = await encryptSplitKeySecret(splitKeyData, wallet.mnemonic as string);
      }
      break;
    }
    case SecretManagementStrategy.DKMSV3:
    default: {
      const dkmsV3KeyData: DkmsV3KeyData = {
        magicKmsInfo,
        systemClockOffset,
      };
      fullEncryptedPrivateKey = await encryptDkmsV3KeySecret(dkmsV3KeyData, wallet.privateKey as string);
      if (wallet.mnemonic) {
        fullEncryptedMnemonic = await encryptDkmsV3KeySecret(dkmsV3KeyData, wallet.mnemonic as string);
      }
    }
  }

  wallet.mnemonic = null;
  wallet.privateKey = null;

  const { data } = await AuthenticationService.syncWallet(
    userID,
    wallet.address as string,
    walletType,
    fullEncryptedPrivateKey,
    encryptedPkShares.MagicShare,
    encryptedPkShares.ClientShare,
    fullEncryptedMnemonic,
    encryptedMnemonicShares.MagicShare,
    encryptedMnemonicShares.ClientShare,
    (wallet.HDWalletPath || HDWalletPath.path0) as string | undefined,
    clientShareMetadata,
  );

  const userKeys: UserKeys = {
    authUserId: userID,
    walletId: data.walletId,
    publicAddress: wallet.address as string,
    encryptedPrivateAddress: fullEncryptedPrivateKey,
    encryptedMagicPrivateAddressShare: encryptedPkShares.MagicShare,
    encryptedClientPrivateAddressShare: encryptedPkShares.ClientShare,
    encryptedClientPrivateAddressShareMetadata: clientShareMetadata,
    encryptedSeedPhrase: fullEncryptedMnemonic,
    encryptedMagicSeedPhraseShare: encryptedMnemonicShares.MagicShare,
    encryptedClientSeedPhraseShare: encryptedMnemonicShares.ClientShare,
    encryptedClientSeedPhraseShareMetadata: clientShareMetadata,
    deviceShare: encryptedPkShares.DeviceShare,
  };

  return userKeys;
};
