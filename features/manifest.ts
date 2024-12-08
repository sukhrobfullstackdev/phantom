import { LOCAL_ENV_FILE } from '~/server/constants/env';

/**
 * To enable a feature in Auth Relayer, add a key representing
 * the feature name and set the value to `true`.
 */
export const FeatureManifest = {
  oauth: true,
  'api-health-check': true,
  'dev-statics': !!LOCAL_ENV_FILE,
  'test-mode': true,
  'update-email': true,
  'get-metadata': true,
  'jsdelivr-proxy': true,
  'login-with-oidc': true,
  'login-with-sms': true,
  pnp: true,
  mfa: true,
  settings: true,
  'email-link': true,
  'connect-with-ui': true,
  'email-otp': true,
  'blockchain-ui-methods': true,
  recovery: true,
  'native-methods': true,
  'update-phone-number': true,
  'custom-auth': true,
  'reveal-private-key': true,
  'g-dkms': true,
  'confirm-action': true,
  'device-verification': true,
  // NEW_PLOP_ENTRY
  // add new entries above NEW_PLOP_ENTRY or they could get nuked
};

export type FeatureManifest = typeof FeatureManifest;
export type FeatureName = keyof FeatureManifest;
export const EnabledFeatures = (Object.keys(FeatureManifest) as FeatureName[]).filter(name => !!FeatureManifest[name]);
