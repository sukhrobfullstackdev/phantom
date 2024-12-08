import { MAGIC_WALLET_DAPP_API_KEY, MAGIC_WALLET_DAPP_REFERRER } from '~/shared/constants/env';
import { getApiKey } from '~/app/libs/api-key';
import { getReferrer } from '~/app/libs/get-referrer';
import { store } from '../store';
import { CientFeatureFlags } from '~/app/store/system/system.reducer';

export const getHeaders = () => {
  return {
    headers: isGlobalAppScope() ? { 'X-Magic-Scope': 'global' } : {},
  };
};

export const setGlobalAppScopeHeaders = () => (isGlobalAppScope() ? { 'X-Magic-Scope': 'global' } : {});

/**
 * Global App Scope means an app where the keys are interoperable
 * between Apps that integrate this particular Magic Client.
 * Traditionally known as "Magic Connect" apps, this terminology
 * will be phased out end of Q1 beginning of Q2 2023.
 * As of now:
 * product_type === 'magic' => appScope => 'app'
 * product_type === 'connect' => appScope => 'global'
 */
export const isGlobalAppScope = () => {
  return store.getState().System?.appScope === 'global';
};

export const isEthRPCUIEnabled = () => {
  return store.getState().System.CLIENT_FEATURE_FLAGS.is_signing_ui_enabled;
};

export const isMagicWalletDapp = (): boolean => {
  const apiKey = getApiKey();
  const referrer = getReferrer();
  return apiKey === MAGIC_WALLET_DAPP_API_KEY && referrer === MAGIC_WALLET_DAPP_REFERRER;
};

export const getClientFeatureFlags = (): CientFeatureFlags => {
  return store.getState().System.CLIENT_FEATURE_FLAGS;
};
