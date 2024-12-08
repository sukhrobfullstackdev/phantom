import { resolveToRoot } from '~/server/libs/path-utils';
import { ConfigModifier } from '../../types';

/**
 * Apply general global settings to Webpack configuration.
 */
const general: ConfigModifier = ({ name, config, isDevelopment, isAnalysisMode }) => {
  config.name(name);
  config.context(process.cwd());
  config.target('web');
  config.mode(isDevelopment ? 'development' : 'production');
  config.stats(isDevelopment || isAnalysisMode ? 'minimal' : 'normal');

  config.resolve.extensions.merge(['.ts', '.tsx', '.js']);

  config.resolve.alias.set('~/app', resolveToRoot('core/app'));
  config.resolve.alias.set('~/features', resolveToRoot('features'));
  config.resolve.alias.set('~/server', resolveToRoot('core/server'));
  config.resolve.alias.set('~/shared', resolveToRoot('core/shared'));
  config.resolve.alias.set('~/test', resolveToRoot('test'));
  config.resolve.alias.set('~/node_modules', resolveToRoot('node_modules'));
};

export default general;
