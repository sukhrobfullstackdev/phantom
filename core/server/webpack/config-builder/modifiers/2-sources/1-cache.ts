import HardSourceWebpackPlugin from 'hard-source-webpack-plugin';
import { ConfigModifier } from '../../types';

/**
 * Apply general global settings to Webpack configuration.
 */
const general: ConfigModifier = ({ config, isDevelopment }) => {
  // Enables filesystem caching for faster
  // startups and rebuilds during development.
  if (isDevelopment) {
    config.plugin('hardsource-cache').use(HardSourceWebpackPlugin, [
      {
        test: /mini-css-extract-plugin[\\/]dist[\\/]loader/,
        info: { level: 'error' },
      },
    ]);
  }
};

export default general;
