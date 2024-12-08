export enum SecretManagementStrategy {
  SHAMIRS_SECRET_SHARING = 'SHAMIRS_SECRET_SHARING',
  DKMSV3 = 'DKMSV3',
}

export enum SplitkeyMode {
  BASE = 'BASE',
  CLIENT_SPLIT = 'CLIENT_SPLIT',
}

/**
 * 3 Shares derived when using Shamir's secret sharing
 *  These are PLAINTEXT shares of the secret
 *  Two of these shares can be used to derive the original secret.
 *  We currently do not use the Recovery Share.
 */

export interface PlaintextSecretShares {
  MagicShare: string;
  ClientShare: string;
  RecoveryShare: string;
}

/**
 * Theses shares are ENCRYPTED shares that are stored with Magic backend (current)
 * OR on device.
 * The Magic Share is always encrypted with the Magic KMS
 * The client Share is either encrypted with the Magic KMS or the client KMS
 * The Device Share is encrypted with the Magic KMS.
 */
export interface EncryptedSecretShares {
  MagicShare: string;
  ClientShare: string;
  DeviceShare?: string;
}
