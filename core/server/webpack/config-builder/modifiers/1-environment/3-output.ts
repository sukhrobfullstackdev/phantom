import { resolveToRoot } from '~/server/libs/path-utils';
import { formatFilename, publicPath } from '../../../webpack-utils';
import { ConfigModifier } from '../../types';

/**
 * Apply output settings to Webpack configuration.
 */
const output: ConfigModifier = ({ name, config }) => {
  config.output
    .filename(formatFilename(name, { ext: 'js' }))
    .path(resolveToRoot('build', 'static'))
    .publicPath(publicPath)
    .pathinfo(false);
};

export default output;
