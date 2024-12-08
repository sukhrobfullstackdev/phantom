import { UserInfo } from '../services/authentication/get-user-info';
import { UserKeys } from '../store/auth/auth.reducer';

export const getUserKeysFromUserInfo = (userInfo: UserInfo): UserKeys => {
  return {
    authUserId: userInfo.auth_user_id,
    publicAddress: userInfo.public_address,
    encryptedPrivateAddress: userInfo.encrypted_private_address || '',
    encryptedMagicPrivateAddressShare: userInfo.encrypted_magic_private_address_share || '',
    encryptedClientPrivateAddressShare: userInfo.encrypted_client_private_address_share || '',
    encryptedClientPrivateAddressShareMetadata: userInfo.encrypted_client_private_address_share_metadata || undefined,
    encryptedSeedPhrase: userInfo.encrypted_seed_phrase || '',
    encryptedMagicSeedPhraseShare: userInfo.encrypted_magic_seed_phrase_share || '',
    encryptedClientSeedPhraseShare: userInfo.encrypted_client_seed_phrase_share || '',
    encryptedClientSeedPhraseShareMetadata: userInfo.encrypted_client_seed_phrase_share_metadata || undefined,
    walletId: userInfo.auth_user_wallet_id,
  };
};
