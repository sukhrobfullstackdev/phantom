import { Entry, HotModuleReplacementPlugin } from 'webpack';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import { ConfigModifier, ConfigPostProcessor } from '../../types';
import { getFeatureEntries } from '../../../webpack-utils';

/**
 * Inject entry files into Webpack configuration.
 */
const entry: ConfigModifier = async ({ config, isLegacyBundle, isDevelopment }) => {
  const main = config.entry('main');

  // Manually register some polyfills applicable to all bundles...
  main.add('regenerator-runtime/runtime').add('core-js/stable');

  // Manually register some polyfills applicable to legacy bundles only...
  if (isLegacyBundle) {
    main.add('proxy-polyfill');
  }

  // During development, enable hot-reloading via "React Fast Refresh"
  if (isDevelopment) {
    main.prepend(`webpack-hot-middleware/client?reload=true`).prepend('eventsource-polyfill');
    config.plugin('hot-module-replacement').use(HotModuleReplacementPlugin);
    config.plugin('react-refresh').use(ReactRefreshWebpackPlugin);
  }

  // The bundle's main entry point.
  main.add(`./core/app/index.tsx`);
};

/**
 * Modify `entry` to be dynamic. This makes our Webpack bundle responsive
 * to new framework modules (pages, RPC, etc.) being added at runtime.
 */
export const postProcess: ConfigPostProcessor = webpackConfig => {
  const origMain = (webpackConfig.entry as Entry).main;
  webpackConfig.entry = async () => {
    const featureEntries = await getFeatureEntries();
    return { main: [...origMain], ...featureEntries } as Entry;
  };
};

export default entry;
