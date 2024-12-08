import { DkmsService } from '~/app/services/dkms';
import { EncryptedSecretShares, SecretManagementStrategy, SplitkeyMode } from '~/app/types/dkms-types';
import { DelegatedWalletInfo } from '~/app/types/delegated-wallet-types';
import { UserKeys } from '~/app/store/auth/auth.reducer';
import { WalletSecretManagementInfo } from '~/app/store/system/system.actions';
import * as sss from '@magiclabs/shamirs-secret-sharing';
import { uint8ArrayToBase64 } from '~/app/libs/decode-uint-array';
import { encryptDkmsV3KeySecret, encryptSplitKeySecret } from '~/app/services/dkms/encrypt-secret';
import { reconstructDkmsV3Secret, reconstructSplitKeySecret } from '~/app/services/dkms/decrypt-secret';
import { DkmsV3KeyData } from '~/app/services/dkms/encrypt-and-sync-wallet';

const SUCCESSFUL_ENCRYPTION_RESULT = 'Successful Encryption Result';
const SUCCESSFUL_DECRYPTION_RESULT = 'Successful Decryption Result';

const SYSTEM_CLOCK_OFFSET = 0;

// Mocking out stuff to encrypt
const NEW_USER_ID = 'new user id';
const NEW_WALLET_ADDRESS = 'new wallet address';
const NEW_WALLET_ID = 'new wallet id';
const NEW_WALLET_PK = 'new wallet private key';
const NEW_WALLET_MNEMONIC = 'new wallet mnemonic';
const WALLET_TYPE = 'ETH';

const NEW_USER_KMS_INFO: DelegatedWalletInfo = {
  delegated_access_token: 'a',
  delegated_identity_id: 'b',
  delegated_key_id: 'c',
  delegated_pool_id: 'd',
  should_create_delegated_wallet: true,
};

const RETURNING_USER_KMS_INFO: DelegatedWalletInfo = {
  delegated_access_token: 'a',
  delegated_identity_id: 'b',
  delegated_key_id: 'c',
  delegated_pool_id: 'd',
  should_create_delegated_wallet: false,
};

const CLIENT_SHARE_METADATA = {
  id: 'anything',
};

const EXISTING_ENCRYPTED_PK = 'existing user pk';

const EXISTING_WALLET_ADDRESS = 'bbb';

jest.mock('~/app/services/aws/kms', () => ({
  kmsEncrypt: jest.fn().mockReturnValue('Successful Encryption Result'),
  kmsDecrypt: jest.fn().mockReturnValue('Successful Decryption Result'),
}));

jest.mock('~/app/services/authentication/sync-wallet', () => ({
  syncWallet: jest.fn().mockReturnValue({ data: { walletId: 'new wallet id' } }),
}));

jest.mock('~/app/services/dkms/client-kms', () => ({
  clientKmsEncrypt: jest.fn().mockReturnValue('Successful Encryption Result'),
  clientKmsDecrypt: jest.fn().mockReturnValue('Successful Decryption Result'),
}));

jest.mock('~/app/services/dkms/get-jwt', () => ({
  getJwt: jest.fn().mockReturnValue({ data: { token: 'new jwt token id' } }),
}));

describe('DkmsService', () => {
  beforeEach(() => {
    // implement before each
  });
  afterAll(() => {
    // clean up
  });

  // Encryption helper methods for dkms service
  it('encryptDkmsV3KeySecret should encrypt successfully', async () => {
    // Setup
    const secret = NEW_WALLET_PK;
    const dkmsV3KeyData: DkmsV3KeyData = {
      magicKmsInfo: NEW_USER_KMS_INFO,
      systemClockOffset: SYSTEM_CLOCK_OFFSET,
    };
    // Test
    const result = await encryptDkmsV3KeySecret(dkmsV3KeyData, secret);
    // Assert
    expect(result).toEqual(SUCCESSFUL_ENCRYPTION_RESULT);
  });

  it('encryptSplitKeySecret split-key base mode secret should encrypt successfully', async () => {
    const walletSecretManagementInfo: WalletSecretManagementInfo = {
      strategy: SecretManagementStrategy.SHAMIRS_SECRET_SHARING,
      definition: { mode: SplitkeyMode.BASE },
    };
    const secret = NEW_WALLET_PK;
    const splitKeyData = {
      userID: NEW_USER_ID,
      clientShareMetadata: CLIENT_SHARE_METADATA,
      walletSecretManagementInfo,
      magicKmsInfo: NEW_USER_KMS_INFO,
      walletType: WALLET_TYPE,
      systemClockOffset: SYSTEM_CLOCK_OFFSET,
    };
    const result = await encryptSplitKeySecret(splitKeyData, secret);
    // Assert
    const expected: EncryptedSecretShares = {
      MagicShare: SUCCESSFUL_ENCRYPTION_RESULT,
      DeviceShare: SUCCESSFUL_ENCRYPTION_RESULT,
      ClientShare: SUCCESSFUL_ENCRYPTION_RESULT,
    };
    expect(result).toEqual(expected);
  });

  it('encryptSplitKeySecret split-key client split mode secret should encrypt successfully', async () => {
    const walletSecretManagementInfo: WalletSecretManagementInfo = {
      strategy: SecretManagementStrategy.SHAMIRS_SECRET_SHARING,
      definition: { mode: SplitkeyMode.CLIENT_SPLIT, encryption_endpoint: 'test', decryption_endpoint: 'test' },
    };
    const secret = NEW_WALLET_PK;
    const splitKeyData = {
      userID: NEW_USER_ID,
      clientShareMetadata: CLIENT_SHARE_METADATA,
      walletSecretManagementInfo,
      magicKmsInfo: NEW_USER_KMS_INFO,
      walletType: WALLET_TYPE,
      systemClockOffset: SYSTEM_CLOCK_OFFSET,
    };
    const result = await encryptSplitKeySecret(splitKeyData, secret);
    // Assert
    const expected: EncryptedSecretShares = {
      MagicShare: SUCCESSFUL_ENCRYPTION_RESULT,
      DeviceShare: SUCCESSFUL_ENCRYPTION_RESULT,
      ClientShare: SUCCESSFUL_ENCRYPTION_RESULT,
    };
    expect(result).toEqual(expected);
  });

  it('DkmsService.encryptAndSyncWallet dkmsv3 should encrypt successfully', async () => {
    // Setup
    const walletSecretManagementInfo = { strategy: SecretManagementStrategy.DKMSV3 };

    const new_user_wallet = {
      address: NEW_WALLET_ADDRESS,
      privateKey: NEW_WALLET_PK,
      mnemonic: NEW_WALLET_MNEMONIC,
    };

    // Test
    const result = await DkmsService.encryptAndSyncWallet(
      walletSecretManagementInfo,
      new_user_wallet,
      NEW_USER_KMS_INFO,
      NEW_USER_ID,
      WALLET_TYPE,
      SYSTEM_CLOCK_OFFSET,
    );
    // Assert
    expect(result.authUserId).toEqual(NEW_USER_ID);
    expect(result.publicAddress).toEqual(NEW_WALLET_ADDRESS);
    expect(result.walletId).toEqual(NEW_WALLET_ID);
    expect(result.encryptedPrivateAddress).toEqual(SUCCESSFUL_ENCRYPTION_RESULT);
    expect(result.encryptedSeedPhrase).toEqual(SUCCESSFUL_ENCRYPTION_RESULT);
    expect(result.encryptedClientPrivateAddressShare).toEqual('');
    expect(result.encryptedClientSeedPhraseShare).toEqual('');
    expect(result.encryptedMagicPrivateAddressShare).toEqual('');
    expect(result.encryptedMagicSeedPhraseShare).toEqual('');
  });

  it('DkmsService.encryptAndSyncWallet split-key base mode should return successfully', async () => {
    const walletSecretManagementInfo: WalletSecretManagementInfo = {
      strategy: SecretManagementStrategy.SHAMIRS_SECRET_SHARING,
      definition: { mode: SplitkeyMode.BASE },
    };

    const new_user_wallet = {
      address: NEW_WALLET_ADDRESS,
      privateKey: NEW_WALLET_PK,
      mnemonic: NEW_WALLET_MNEMONIC,
    };

    const result = await DkmsService.encryptAndSyncWallet(
      walletSecretManagementInfo,
      new_user_wallet,
      NEW_USER_KMS_INFO,
      NEW_USER_ID,
      WALLET_TYPE,
      SYSTEM_CLOCK_OFFSET,
    );
    // Assert
    expect(result.authUserId).toEqual(NEW_USER_ID);
    expect(result.publicAddress).toEqual(NEW_WALLET_ADDRESS);
    expect(result.walletId).toEqual(NEW_WALLET_ID);
    expect(result.encryptedPrivateAddress).toEqual('');
    expect(result.encryptedSeedPhrase).toEqual('');
    expect(result.encryptedClientPrivateAddressShare).toEqual(SUCCESSFUL_ENCRYPTION_RESULT);
    expect(result.encryptedClientSeedPhraseShare).toEqual(SUCCESSFUL_ENCRYPTION_RESULT);
    expect(result.encryptedMagicPrivateAddressShare).toEqual(SUCCESSFUL_ENCRYPTION_RESULT);
    expect(result.encryptedMagicSeedPhraseShare).toEqual(SUCCESSFUL_ENCRYPTION_RESULT);
  });
  it('encryptAndSyncWallet split-key client-split mode should return successfully', async () => {
    const walletSecretManagementInfo: WalletSecretManagementInfo = {
      strategy: SecretManagementStrategy.SHAMIRS_SECRET_SHARING,
      definition: { mode: SplitkeyMode.CLIENT_SPLIT, encryption_endpoint: 'test', decryption_endpoint: 'test' },
    };

    const new_user_wallet = {
      address: NEW_WALLET_ADDRESS,
      privateKey: NEW_WALLET_PK,
      mnemonic: NEW_WALLET_MNEMONIC,
    };

    const result = await DkmsService.encryptAndSyncWallet(
      walletSecretManagementInfo,
      new_user_wallet,
      NEW_USER_KMS_INFO,
      NEW_USER_ID,
      WALLET_TYPE,
      SYSTEM_CLOCK_OFFSET,
    );
    // Assert
    expect(result.authUserId).toEqual(NEW_USER_ID);
    expect(result.publicAddress).toEqual(NEW_WALLET_ADDRESS);
    expect(result.walletId).toEqual(NEW_WALLET_ID);
    expect(result.encryptedPrivateAddress).toEqual('');
    expect(result.encryptedSeedPhrase).toEqual('');
    expect(result.encryptedClientPrivateAddressShare).toEqual(SUCCESSFUL_ENCRYPTION_RESULT);
    expect(result.encryptedClientSeedPhraseShare).toEqual(SUCCESSFUL_ENCRYPTION_RESULT);
    expect(result.encryptedMagicPrivateAddressShare).toEqual(SUCCESSFUL_ENCRYPTION_RESULT);
    expect(result.encryptedMagicSeedPhraseShare).toEqual(SUCCESSFUL_ENCRYPTION_RESULT);
  });

  // Secret reconstruction helper methods for dkms service.
  it('reconstructDkmsV3Secret should throw error if no encrypted secret provided', async () => {
    try {
      // Test
      await reconstructDkmsV3Secret(undefined as any, RETURNING_USER_KMS_INFO, undefined);
    } catch (err) {
      // Assert
      expect((err as Error).message).toEqual('No encrypted secret provided');
    }
  });

  it('reconstructDkmsV3Secret should reconstruct secret successfully', async () => {
    // Test
    const result = await reconstructDkmsV3Secret(EXISTING_ENCRYPTED_PK, RETURNING_USER_KMS_INFO, SYSTEM_CLOCK_OFFSET);
    // Assert
    const expected = SUCCESSFUL_DECRYPTION_RESULT;
    expect(result).toEqual(expected);
  });

  it('reconstructSplitKeySecret base mode should throw error if no encrypted magic share provided', async () => {
    const encryptedSecretShares: EncryptedSecretShares = {
      MagicShare: undefined as any,
      ClientShare: undefined as any,
    };
    const walletSecretManagementInfo = {
      strategy: SecretManagementStrategy.SHAMIRS_SECRET_SHARING,
      definition: { mode: SplitkeyMode.BASE },
    };

    try {
      await reconstructSplitKeySecret(
        NEW_USER_ID,
        encryptedSecretShares,
        CLIENT_SHARE_METADATA,
        WALLET_TYPE,
        walletSecretManagementInfo,
        RETURNING_USER_KMS_INFO,
        SYSTEM_CLOCK_OFFSET,
      );
    } catch (err) {
      expect((err as Error).message).toEqual('No Encrypted Magic Share provided');
    }
  });

  it('reconstructSplitKeySecret base mode should throw error if no encrypted client share pk provided', async () => {
    const encryptedSecretShares: EncryptedSecretShares = {
      MagicShare: SUCCESSFUL_ENCRYPTION_RESULT,
      ClientShare: undefined as any,
    };
    const walletSecretManagementInfo = {
      strategy: SecretManagementStrategy.SHAMIRS_SECRET_SHARING,
      definition: { mode: SplitkeyMode.BASE },
    };
    try {
      await reconstructSplitKeySecret(
        NEW_USER_ID,
        encryptedSecretShares,
        CLIENT_SHARE_METADATA,
        WALLET_TYPE,
        walletSecretManagementInfo,
        RETURNING_USER_KMS_INFO,
        SYSTEM_CLOCK_OFFSET,
      );
    } catch (err) {
      expect((err as Error).message).toEqual('No Encrypted Client Share provided');
    }
  });

  it('reconstructSplitKeySecret base mode should reconstruct secret successfully', async () => {
    const testSecretKey = 'Test Secret Key';
    const shares = sss.split(Buffer.from(testSecretKey), { shares: 3, threshold: 2 });
    const PlaintextMagicShare = uint8ArrayToBase64(shares[0] as Uint8Array);
    const PlaintextClientShare = uint8ArrayToBase64(shares[1] as Uint8Array);

    // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
    const { kmsDecrypt } = require('~/app/services/aws/kms');
    kmsDecrypt
      .mockImplementationOnce(() => Promise.resolve(PlaintextMagicShare))
      .mockImplementationOnce(() => Promise.resolve(PlaintextClientShare));

    const encryptedSecretShares: EncryptedSecretShares = {
      MagicShare: SUCCESSFUL_ENCRYPTION_RESULT,
      ClientShare: SUCCESSFUL_ENCRYPTION_RESULT,
    };
    const walletSecretManagementInfo = {
      strategy: SecretManagementStrategy.SHAMIRS_SECRET_SHARING,
      definition: { mode: SplitkeyMode.BASE },
    };
    const result = await reconstructSplitKeySecret(
      NEW_USER_ID,
      encryptedSecretShares,
      CLIENT_SHARE_METADATA,
      WALLET_TYPE,
      walletSecretManagementInfo,
      RETURNING_USER_KMS_INFO,
      SYSTEM_CLOCK_OFFSET,
    );

    expect(result.secret).toEqual(testSecretKey);
  });

  it('reconstructSplitKeySecret client split mode should reconstruct secret successfully', async () => {
    const testSecretKey = 'Test Secret Key';
    const shares = sss.split(Buffer.from(testSecretKey), { shares: 3, threshold: 2 });
    const PlaintextMagicShare = uint8ArrayToBase64(shares[0] as Uint8Array);
    const PlaintextClientShare = uint8ArrayToBase64(shares[1] as Uint8Array);

    // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
    const { kmsDecrypt } = require('~/app/services/aws/kms');
    kmsDecrypt.mockImplementationOnce(() => Promise.resolve(PlaintextMagicShare));

    // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
    const { clientKmsDecrypt } = require('~/app/services/dkms/client-kms');
    clientKmsDecrypt.mockImplementationOnce(() => Promise.resolve(PlaintextClientShare));

    const encryptedSecretShares: EncryptedSecretShares = {
      MagicShare: SUCCESSFUL_ENCRYPTION_RESULT,
      ClientShare: SUCCESSFUL_ENCRYPTION_RESULT,
    };
    const walletSecretManagementInfo: WalletSecretManagementInfo = {
      strategy: SecretManagementStrategy.SHAMIRS_SECRET_SHARING,
      definition: { mode: SplitkeyMode.CLIENT_SPLIT, encryption_endpoint: 'test', decryption_endpoint: 'test' },
    };
    const result = await reconstructSplitKeySecret(
      NEW_USER_ID,
      encryptedSecretShares,
      CLIENT_SHARE_METADATA,
      WALLET_TYPE,
      walletSecretManagementInfo,
      RETURNING_USER_KMS_INFO,
      SYSTEM_CLOCK_OFFSET,
    );

    expect(result.secret).toEqual(testSecretKey);
  });
  it('DkmsService.reconstructWalletPk should throw error if no magic kms information provided', async () => {
    const userKeys: UserKeys = { authUserId: NEW_USER_ID };
    const walletSecretManagementInfo = { strategy: SecretManagementStrategy.DKMSV3 };
    try {
      await DkmsService.reconstructWalletPk(userKeys, WALLET_TYPE, walletSecretManagementInfo, undefined);
    } catch (err) {
      expect((err as Error).message).toEqual('No Magic KMS Info');
    }
  });

  it('DkmsService.reconstructWalletPk dkmsv3 should reconstruct pk successfully', async () => {
    const userKeys: UserKeys = {
      authUserId: NEW_USER_ID,
      walletId: NEW_WALLET_ID,
      publicAddress: NEW_WALLET_ADDRESS,
      encryptedPrivateAddress: EXISTING_ENCRYPTED_PK,
    };
    const walletSecretManagementInfo = { strategy: SecretManagementStrategy.DKMSV3 };

    const expected = SUCCESSFUL_DECRYPTION_RESULT;

    const result = await DkmsService.reconstructWalletPk(
      userKeys,
      WALLET_TYPE,
      walletSecretManagementInfo,
      RETURNING_USER_KMS_INFO,
    );

    expect(result).toEqual(expected);
  });

  it('DkmsService.reconstructWalletPk split-key base mode should reconstruct pk successfully', async () => {
    const testSecretKey = 'Test Secret Key';
    const shares = sss.split(Buffer.from(testSecretKey), { shares: 3, threshold: 2 });
    const PlaintextMagicShare = uint8ArrayToBase64(shares[0] as Uint8Array);
    const PlaintextClientShare = uint8ArrayToBase64(shares[1] as Uint8Array);

    // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
    const { kmsDecrypt } = require('~/app/services/aws/kms');
    kmsDecrypt
      .mockImplementationOnce(() => Promise.resolve(PlaintextMagicShare))
      .mockImplementationOnce(() => Promise.resolve(PlaintextClientShare));

    const userKeys: UserKeys = {
      authUserId: NEW_USER_ID,
      walletId: NEW_WALLET_ID,
      publicAddress: NEW_WALLET_ADDRESS,
      encryptedMagicPrivateAddressShare: SUCCESSFUL_ENCRYPTION_RESULT,
      encryptedClientPrivateAddressShare: SUCCESSFUL_ENCRYPTION_RESULT,
    };
    const walletSecretManagementInfo = {
      strategy: SecretManagementStrategy.SHAMIRS_SECRET_SHARING,
      definition: { mode: SplitkeyMode.BASE },
    };

    const result = await DkmsService.reconstructWalletPk(
      userKeys,
      WALLET_TYPE,
      walletSecretManagementInfo,
      RETURNING_USER_KMS_INFO,
      undefined,
      SYSTEM_CLOCK_OFFSET,
    );
    expect(result).toEqual(testSecretKey);
  });

  it('DkmsService.reconstructWalletMnemonic dkmsv3 should reconstruct mnemonic successfully', async () => {
    const userKeys: UserKeys = {
      authUserId: NEW_USER_ID,
      walletId: NEW_WALLET_ID,
      publicAddress: NEW_WALLET_ADDRESS,
      encryptedSeedPhrase: EXISTING_ENCRYPTED_PK,
    };
    const walletSecretManagementInfo = { strategy: SecretManagementStrategy.DKMSV3 };

    const expected = SUCCESSFUL_DECRYPTION_RESULT;

    const result = await DkmsService.reconstructWalletMnemonic(
      userKeys,
      WALLET_TYPE,
      walletSecretManagementInfo,
      RETURNING_USER_KMS_INFO,
    );

    expect(result).toEqual(expected);
  });

  it('DkmsService.reconstructWalletMnemonic split-key base mode should reconstruct mnemonic successfully', async () => {
    const testSecretKey = 'Test Secret Key';
    const shares = sss.split(Buffer.from(testSecretKey), { shares: 3, threshold: 2 });
    const PlaintextMagicShare = uint8ArrayToBase64(shares[0] as Uint8Array);
    const PlaintextClientShare = uint8ArrayToBase64(shares[1] as Uint8Array);

    // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
    const { kmsDecrypt } = require('~/app/services/aws/kms');
    kmsDecrypt
      .mockImplementationOnce(() => Promise.resolve(PlaintextMagicShare))
      .mockImplementationOnce(() => Promise.resolve(PlaintextClientShare));

    const userKeys: UserKeys = {
      authUserId: NEW_USER_ID,
      walletId: NEW_WALLET_ID,
      publicAddress: NEW_WALLET_ADDRESS,
      encryptedMagicSeedPhraseShare: SUCCESSFUL_ENCRYPTION_RESULT,
      encryptedClientSeedPhraseShare: SUCCESSFUL_ENCRYPTION_RESULT,
    };
    const walletSecretManagementInfo = {
      strategy: SecretManagementStrategy.SHAMIRS_SECRET_SHARING,
      definition: { mode: SplitkeyMode.BASE },
    };

    const result = await DkmsService.reconstructWalletMnemonic(
      userKeys,
      WALLET_TYPE,
      walletSecretManagementInfo,
      RETURNING_USER_KMS_INFO,
      SYSTEM_CLOCK_OFFSET,
    );
    expect(result).toEqual(testSecretKey);
  });

  // it('reconstructWalletMnemonic split-key client-split mode should reconstruct mnemonic successfully', () => {});
  // it('reconstructWalletMnemonic split-key mode device-share recovery should reconstruct mnemonic successfully', () => {});
});
