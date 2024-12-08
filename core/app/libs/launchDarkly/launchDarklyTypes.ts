export type KnownKeys<T> = {
  [K in keyof T]: string extends K ? never : number extends K ? never : K;
} extends { [_ in keyof T]: infer U }
  ? U
  : never;

export type OauthV2EnabledFlagValue = {
  enabled: boolean;
  providers: string[];
};

export type CustomizedNFTMarketplaceURLFlagValue = {
  enabled: boolean;
  url: string;
};

export type LaunchDarklyFeatureFlags = {
  'is-send-funds-enabled': boolean;
  'is-third-party-wallets-enabled': boolean;
  'is-verified-application': boolean;
  'is-fiat-on-ramp-enabled': boolean;
  'is-fiat-on-ramp-sardine-enabled': boolean;
  'is-fiat-on-ramp-stripe-enabled': boolean;
  'is-request-user-info-third-party-wallet-enabled': boolean;
  'is-reveal-seed-phrase-ux-enabled': boolean;
  'is-nft-purchase-enabled': boolean;
  'is-sms-recovery-enabled': boolean;
  'is-nft-viewer-enabled': boolean;
  'is-redirect-allowlist-enabled': boolean;
  'is-magic-logo-hidden': boolean;
  'is-fiat-on-ramp-paypal-enabled': boolean;
  'is-email-otp-v2-enabled': boolean;
  'is-config-v2-enabled': boolean;
  'is-confirm-action-flow-enabled': boolean;
  'is-action-otp-challenge-enforced': boolean;
  'is-network-switcher-enabled': boolean;
  'is-trial-mode-banner-enforced': boolean;
  'is-nft-transfer-enabled': boolean;
  'is-reveal-seed-phrase-allowed': boolean;
  'is-email-customization-enabled': boolean;
  'is-toggle-security-otp-enabled': boolean;
  'is-oauthv2-enabled': OauthV2EnabledFlagValue;
  'is-enforce-redirect-allowlist-enabled': boolean;
  'is-customize-nft-marketplace-url-enable': CustomizedNFTMarketplaceURLFlagValue;
};

export type LaunchDarklySettings = {
  [key in keyof LaunchDarklyFeatureFlags]?: {
    current: boolean;
    previous: boolean;
  };
};

export type LaunchDarklyFeatureFlagsStrict = {
  [K in KnownKeys<LaunchDarklyFeatureFlags>]: boolean | OauthV2EnabledFlagValue | CustomizedNFTMarketplaceURLFlagValue;
};
