import ProgressBar from 'webpackbar';
import chalk from 'chalk';
import { ConfigModifier } from '../../types';

/**
 * Configure Webpack to measure build progress
 * with a nice-looking status bar.
 */
const buildProgress: ConfigModifier = ({ config, isLegacyBundle }) => {
  const prettifiedName = isLegacyBundle ? chalk`{bold LEGACY} CLIENT` : chalk`{bold MODERN} CLIENT`;

  config
    .plugin('build-progress')
    .use(ProgressBar, [{ name: prettifiedName, color: isLegacyBundle ? 'cyan' : 'green' }]);
};

export default buildProgress;
