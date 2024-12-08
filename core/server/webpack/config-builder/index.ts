import Config from 'webpack-chain';
import path from 'path';
import { IS_NODE_ENV_DEV, IS_NODE_ENV_PROD, IS_STATIC_DEPLOYMENT } from '~/shared/constants/env';
import { ANALYZE_BUNDLE } from '../../constants/env';
import { BundleName } from '../webpack-utils';
import { ConfigModifierContext } from './types';
import { sequentialPromise } from '~/shared/libs/sequential-promise';
import { recursiveReadDir, resolveToRoot } from '~/server/libs/path-utils';

/**
 * Composes a Webpack configuration.
 */
export async function createConfig(name: BundleName) {
  const config = new Config();
  config.parallelism(50);

  const ctx: ConfigModifierContext = {
    name,
    config,
    isLegacyBundle: name.indexOf('.legacy') !== -1,
    isDevelopment: IS_NODE_ENV_DEV,
    isProduction: IS_NODE_ENV_PROD,
    isAnalysisMode: ANALYZE_BUNDLE,
    isStaticDeployment: IS_STATIC_DEPLOYMENT,
  };

  const modifiers = (await recursiveReadDir(path.join(__dirname, 'modifiers'))).map(file => {
    // eslint-disable-next-line import/no-dynamic-require, global-require, @typescript-eslint/no-var-requires
    return require(resolveToRoot(file));
  });

  const modifierSteps = modifiers.map(modifier => modifier.default);
  const modifierPostProcessors = modifiers.map(modifier => modifier.postProcess);

  // Build the initial config using `webpack-chain`
  await sequentialPromise(
    modifierSteps.map(step => {
      if (step) {
        return step(ctx);
      }

      return undefined;
    }),
  );

  const webpackConfig = config.toConfig();

  // Post-process the generated webpack configuration with additional
  // options not supported by the `webpack-chain` interface.
  await sequentialPromise(
    modifierPostProcessors.map(postProcess => {
      if (postProcess) {
        return postProcess(webpackConfig, ctx);
      }

      return undefined;
    }),
  );

  return webpackConfig;
}
