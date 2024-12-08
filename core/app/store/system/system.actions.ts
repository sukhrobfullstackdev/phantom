import { createAction } from 'typesafe-actions';
import { JsonRpcResponsePayload, MagicIncomingWindowMessage } from 'magic-sdk';
import * as actionTypes from './system.actionTypes';
import { MessageChannelService } from '../../services/message-channel';
import { trackRpcChannelStarted } from '~/app/libs/web3-utils';
import { LaunchDarklyFeatureFlags } from '~/app/libs/launchDarkly/launchDarklyTypes';
import { AccessAllowlists, CientFeatureFlags, ConfiguredAuthProviders, PremiumFeatures } from './system.reducer';

/**
 * Start listening for JSON RPC requests.
 */
export const startJsonRpcMessageChannel = createAction(actionTypes.START_JSON_RPC_MESSAGE_CHANNEL, () => {
  trackRpcChannelStarted();
  window.addEventListener('message', MessageChannelService.rpc.handle);
})();

/**
 * Stop listening JSON RPC requests.
 */
export const stopJsonRpcMessageChannel = createAction(actionTypes.STOP_JSON_RPC_MESSAGE_CHANNEL, () => {
  window.removeEventListener('message', MessageChannelService.rpc.handle);
})();

/**
 * Start listening for theme preview updates.
 */
export const startThemePreviewMessageChannel = createAction(actionTypes.START_THEME_PREVIEW_MESSAGE_CHANNEL, () => {
  window.addEventListener('message', MessageChannelService.themePreview.handle);
  MessageChannelService.themePreview.postReady();
})();

/**
 * Stop listening for theme preview updates.
 */
export const stopThemePreviewMessageChannel = createAction(actionTypes.STOP_THEME_PREVIEW_MESSAGE_CHANNEL, () => {
  window.removeEventListener('message', MessageChannelService.themePreview.handle);
})();

/**
 * Dispatches the "overlay ready" signal to the SDK.
 */
export const overlayGreenlight = createAction(actionTypes.FORTMATIC_OVERLAY_GREENLIGHT, () => {
  MessageChannelService.rpc.post(MagicIncomingWindowMessage.MAGIC_OVERLAY_READY);
})();

/**
 * Dispatches the "show overlay" signal to the SDK.
 */
export const showOverlay = createAction(actionTypes.FORTMATIC_SHOW_OVERLAY, () => {
  MessageChannelService.rpc.post(MagicIncomingWindowMessage.MAGIC_SHOW_OVERLAY);
})();

/**
 * Dispatches the "hide overlay" signal to the SDK.
 */
export const hideOverlay = createAction(actionTypes.FORTMATIC_HIDE_OVERLAY, () => {
  MessageChannelService.rpc.post(MagicIncomingWindowMessage.MAGIC_HIDE_OVERLAY);
})();

/**
 * Dispatches the general announcements to SDK
 */
export const informSdkOfProductAnnouncement = createAction(
  actionTypes.SEND_PRODUCT_ANNOUNCEMENT,
  (product_announcement: string) => {
    const productAnnouncementResponse: JsonRpcResponsePayload = {
      jsonrpc: '2.0',
      id: null,
      result: { product_announcement },
      error: undefined,
    };
    MessageChannelService.rpc.post(
      MagicIncomingWindowMessage.MAGIC_SEND_PRODUCT_ANNOUNCEMENT,
      productAnnouncementResponse,
    );
  },
)();

export const setShowUI = createAction(actionTypes.SET_SHOW_UI, (showUI: boolean) => showUI)();

export const setSystemClockOffset = createAction(
  actionTypes.SET_SYSTEM_CLOCK_OFFSET,
  (utcSourceOfTruthMilliseconds: number) => utcSourceOfTruthMilliseconds - Date.now(),
)();

export const setAppScope = createAction(actionTypes.SET_APP_SCOPE, (appScope: 'app' | 'global') => appScope)();

export const setLaunchDarklyFeatureFlags = createAction(
  actionTypes.SET_LAUNCH_DARKLY_FEATURE_FLAGS,
  (LAUNCH_DARKLY_FEATURE_FLAGS: LaunchDarklyFeatureFlags) => LAUNCH_DARKLY_FEATURE_FLAGS,
)();

export const setClientFeatureFlags = createAction(
  actionTypes.SET_CLIENT_FEATURE_FLAGS,
  (CLIENT_FEATURE_FLAGS: CientFeatureFlags) => CLIENT_FEATURE_FLAGS,
)();

export const setConfirmActionId = createAction(
  actionTypes.SET_CONFIRM_ACTION_ID,
  (confirmActionId: string) => confirmActionId,
)();

export const setPremiumFeatures = createAction(
  actionTypes.SET_PREMIUM_FEATURES,
  (premiumFeatures: PremiumFeatures) => premiumFeatures,
)();

export const setConfiguredAuthProviders = createAction(
  actionTypes.SET_CONFIGURED_AUTH_PROVIDERS,
  (configuredAuthProviders: ConfiguredAuthProviders) => configuredAuthProviders,
)();

export const setAccessAllowlists = createAction(
  actionTypes.SET_ACCESS_ALLOWLISTS,
  (accessAllowlists: AccessAllowlists) => accessAllowlists,
)();

export const setLoadingClientConfig = createAction(
  actionTypes.SET_LOADING_CLIENT_CONFIG,
  (isLoadingClientConfig: boolean) => isLoadingClientConfig,
)();

export const setIsEnterprise = createAction(actionTypes.SET_IS_ENTERPRISE, (isEnterprise: boolean) => isEnterprise)();

export const setEventOrigin = createAction(actionTypes.SET_EVENT_ORIGIN, (eventOrigin: string) => eventOrigin)();

export const setIsSecurityOtpEnabled = createAction(
  actionTypes.SET_IS_SECURITY_OTP_ENABLED,
  (isSecurityOtpEnabled: boolean) => isSecurityOtpEnabled,
)();

export interface WalletSecretManagementInfo {
  definition?: {
    mode?: 'BASE' | 'CLIENT_SPLIT';
    encryption_endpoint?: string;
    decryption_endpoint?: string;
  };
  strategy: 'DKMSV3' | 'SHAMIRS_SECRET_SHARING';
}

export const setWalletSecretManagementInfo = createAction(
  actionTypes.SET_SECRET_MANAGEMENT_INFO,
  (walletSecretManagementInfo: WalletSecretManagementInfo) => walletSecretManagementInfo,
)();

export const setLegacyRedirectEnforcement = createAction(
  actionTypes.SET_LEGACY_REDIRECT_ENFORCEMENT,
  (isLegacyRedirectEnforcement: boolean) => isLegacyRedirectEnforcement,
)();
