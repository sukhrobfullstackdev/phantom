export enum WalletType {
  ETH = 'ETH',
  BITCOIN = 'BITCOIN',
  FLOW = 'FLOW',
  ICON = 'ICON',
  HARMONY = 'HARMONY',
  SOLANA = 'SOLANA',
  ZILLIQA = 'ZILLIQA',
  TAQUITO = 'TAQUITO',
  ALGOD = 'ALGOD',
  HEDERA = 'HEDERA',
  NEAR = 'NEAR',
  COSMOS = 'COSMOS',
  APTOS = 'APTOS',
  SUI = 'SUI',
}

export enum SDKType {
  MagicSDK = 'magic-sdk',
  MagicRN = 'magic-sdk-rn', // Keeping this here to track legacy mobile RN SDK users
  MagicBareRN = 'magic-sdk-rn-bare',
  MagicExpoRN = 'magic-sdk-rn-expo',
  MagicIOS = 'magic-sdk-ios',
  MagicAndroid = 'magic-sdk-android',
  MagicFlutter = 'magic-sdk-flutter',
  MagicUnity = 'magic-sdk-unity',
}

export const TrackingSourceMagic = 'phantom-magic' as const;
export const TrackingSourceMagicConnect = 'phantom-magic-connect' as const;

export enum LoginMethodType {
  EmailLink = 'email_link',
  WebAuthn = 'webauthn',
  OAuth2 = 'oauth2',
  SMS = 'sms',
}

export const SupportedNetwork = ['mainnet', 'goerli', 'sepolia'] as const;
