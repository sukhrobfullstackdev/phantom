import webpack from 'webpack';
import { createConfig } from './config-builder';
import { IS_NODE_ENV_DEV } from '~/shared/constants/env';
import { SHOULD_CREATE_LEGACY_BUNDLE_FOR_DEVELOPMENT } from '~/server/constants/env';

/**
 * Creates a Webpack multi-compiler containing all
 * the bundle configurations required for the
 * current environment.
 */
export async function createCompiler() {
  const [appModern, appLegacy] = await Promise.all([createConfig('app'), createConfig('app.legacy')]);

  const deployableConfigs = [appModern, appLegacy];
  const developmentConfigs = [SHOULD_CREATE_LEGACY_BUNDLE_FOR_DEVELOPMENT ? appLegacy : appModern];

  return webpack(IS_NODE_ENV_DEV ? developmentConfigs : deployableConfigs);
}
