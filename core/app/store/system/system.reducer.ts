import { ActionType, createReducer } from 'typesafe-actions';
import * as SystemActions from './system.actions';
import { WalletSecretManagementInfo } from './system.actions';
import { LaunchDarklyFeatureFlagsStrict } from '~/app/libs/launchDarkly/launchDarklyTypes';
import { SecretManagementStrategy } from '~/app/types/dkms-types';

export interface CientFeatureFlags {
  is_signing_ui_enabled: boolean;
  is_nft_viewer_enabled: boolean;
  is_nft_transfer_enabled: boolean;
  is_send_transaction_ui_enabled: boolean;
  is_fiat_onramp_enabled: boolean;
  is_gasless_transactions_enabled: boolean;
  is_transaction_confirmation_enabled: boolean;
}

export type PremiumFeatures = {
  isAuthPremiumEnabled: boolean;
  isConnectPremiumEnabled: boolean;
  isVipEnabled: boolean;
};

export type ConfiguredAuthProviders = {
  primaryLoginProviders: string[];
  secondaryLoginProviders: string[];
  socialLoginProviders: string[];
};

export interface AccessAllowlists {
  bundle: string[];
  domain: string[];
  redirect_url: string[];
}

interface SystemState {
  isJsonRpcMessageChannelOpen: boolean;
  isThemePreviewMessageChannelOpen: boolean;
  isOverlayShowing: boolean;
  showUI: boolean;
  systemClockOffset: number;
  appScope: 'app' | 'global';
  LAUNCH_DARKLY_FEATURE_FLAGS: LaunchDarklyFeatureFlagsStrict;
  CLIENT_FEATURE_FLAGS: CientFeatureFlags;
  isEnterprise: boolean;
  confirmActionId: string;
  premiumFeatures: PremiumFeatures;
  configuredAuthProviders: ConfiguredAuthProviders;
  accessAllowlists?: AccessAllowlists;
  isLoadingClientConfig: boolean;
  eventOrigin: string;
  isSecurityOtpEnabled: boolean;
  isLegacyRedirectEnforcement: boolean;
  walletSecretMangementInfo: WalletSecretManagementInfo;
}

type SystemActions = ActionType<typeof SystemActions>;

const initialState: SystemState = {
  isJsonRpcMessageChannelOpen: false,
  isThemePreviewMessageChannelOpen: false,
  isOverlayShowing: false,
  showUI: false,
  systemClockOffset: 0,
  appScope: 'app', // 'global' (MC) | 'app' (MA/MWS) '
  LAUNCH_DARKLY_FEATURE_FLAGS: {
    'is-send-funds-enabled': false,
    'is-third-party-wallets-enabled': false,
    'is-verified-application': false,
    'is-fiat-on-ramp-enabled': false, // clientFeatureFlags "is_fiat_onramp_enabled
    'is-fiat-on-ramp-sardine-enabled': false,
    'is-fiat-on-ramp-stripe-enabled': false,
    'is-request-user-info-third-party-wallet-enabled': false,
    'is-reveal-seed-phrase-ux-enabled': false,
    'is-nft-purchase-enabled': false,
    'is-sms-recovery-enabled': false,
    'is-nft-viewer-enabled': false, // clientFeatureFlags "is_nft_viewer_enabled
    'is-redirect-allowlist-enabled': false,
    'is-magic-logo-hidden': false,
    'is-fiat-on-ramp-paypal-enabled': false,
    'is-email-otp-v2-enabled': false,
    'is-config-v2-enabled': false,
    'is-confirm-action-flow-enabled': false,
    'is-action-otp-challenge-enforced': false,
    'is-network-switcher-enabled': true,
    'is-trial-mode-banner-enforced': false,
    'is-nft-transfer-enabled': false, // clientFeatureFlags "is_nft_transfer_enabled
    'is-reveal-seed-phrase-allowed': false,
    'is-email-customization-enabled': false,
    'is-toggle-security-otp-enabled': false,
    'is-enforce-redirect-allowlist-enabled': true,
    'is-oauthv2-enabled': {
      enabled: false,
      providers: [],
    },
    'is-customize-nft-marketplace-url-enable': {
      enabled: false,
      url: '',
    },
  },
  CLIENT_FEATURE_FLAGS: {
    is_signing_ui_enabled: true,
    is_nft_viewer_enabled: true,
    is_nft_transfer_enabled: true,
    is_send_transaction_ui_enabled: true,
    is_fiat_onramp_enabled: true,
    is_gasless_transactions_enabled: true,
    is_transaction_confirmation_enabled: false,
  },
  isEnterprise: false,
  confirmActionId: '',
  premiumFeatures: {
    isAuthPremiumEnabled: false,
    isConnectPremiumEnabled: false,
    isVipEnabled: false,
  },
  configuredAuthProviders: {
    primaryLoginProviders: [],
    secondaryLoginProviders: [],
    socialLoginProviders: [],
  },
  accessAllowlists: undefined,
  isLoadingClientConfig: false,
  eventOrigin: '',
  isSecurityOtpEnabled: false,
  isLegacyRedirectEnforcement: false,
  walletSecretMangementInfo: { strategy: SecretManagementStrategy.DKMSV3, definition: undefined },
};

export const System = createReducer<SystemState, SystemActions>(initialState)
  .handleAction(SystemActions.startJsonRpcMessageChannel, state => ({ ...state, isJsonRpcMessageChannelOpen: true }))
  .handleAction(SystemActions.stopJsonRpcMessageChannel, state => ({ ...state, isJsonRpcMessageChannelOpen: false }))
  .handleAction(SystemActions.startThemePreviewMessageChannel, state => ({
    ...state,
    isThemePreviewMessageChannelOpen: true,
  }))
  .handleAction(SystemActions.stopThemePreviewMessageChannel, state => ({
    ...state,
    isThemePreviewMessageChannelOpen: false,
  }))
  .handleAction(SystemActions.showOverlay, state => ({ ...state, isOverlayShowing: true }))
  .handleAction(SystemActions.hideOverlay, state => ({ ...state, isOverlayShowing: false }))
  .handleAction(SystemActions.setShowUI, (state, action) => ({ ...state, showUI: action.payload }))
  .handleAction(SystemActions.setSystemClockOffset, (state, action) => ({
    ...state,
    systemClockOffset: action.payload,
  }))
  .handleAction(SystemActions.setAppScope, (state, action) => ({ ...state, appScope: action.payload }))
  .handleAction(SystemActions.setClientFeatureFlags, (state, action) => ({
    ...state,
    CLIENT_FEATURE_FLAGS: action.payload,
  }))
  .handleAction(SystemActions.setLaunchDarklyFeatureFlags, (state, action) => ({
    ...state,
    LAUNCH_DARKLY_FEATURE_FLAGS: action.payload,
  }))
  .handleAction(SystemActions.setConfirmActionId, (state, action) => ({
    ...state,
    confirmActionId: action.payload,
  }))
  .handleAction(SystemActions.setPremiumFeatures, (state, action) => ({
    ...state,
    premiumFeatures: action.payload,
  }))
  .handleAction(SystemActions.setConfiguredAuthProviders, (state, action) => ({
    ...state,
    configuredAuthProviders: action.payload,
  }))
  .handleAction(SystemActions.setAccessAllowlists, (state, action) => ({
    ...state,
    accessAllowlists: action.payload,
  }))
  .handleAction(SystemActions.setIsEnterprise, (state, action) => ({
    ...state,
    isEnterprise: action.payload,
  }))
  .handleAction(SystemActions.setEventOrigin, (state, action) => ({
    ...state,
    eventOrigin: action.payload,
  }))
  .handleAction(SystemActions.setIsSecurityOtpEnabled, (state, action) => ({
    ...state,
    isSecurityOtpEnabled: action.payload,
  }))
  .handleAction(SystemActions.setLegacyRedirectEnforcement, (state, action) => ({
    ...state,
    isLegacyRedirectEnforcement: action.payload,
  }))
  .handleAction(SystemActions.setWalletSecretManagementInfo, (state, action) => ({
    ...state,
    walletSecretMangementInfo: action.payload,
  }));
