import HtmlWebpackPlugin from 'html-webpack-plugin';
import { resolveToRoot } from '~/server/libs/path-utils';
import { ConfigModifier } from '../../types';

/**
 * Configure Webpack to produce an `{name}.html` file at the build root to support
 * legacy `auth.fortmatic.com` deployments.
 *
 * This will be deprecated in the near future along with `auth.fortmatic.com`...
 */
const legacy_HTML: ConfigModifier = ({ name, config, isStaticDeployment }) => {
  if (isStaticDeployment) {
    const template = resolveToRoot(`./core/app/auth.fortmatic.com_index.html`);
    const filename = `../${name}.html`; // The output filename...
    config.plugin('legacy_HTML').use(HtmlWebpackPlugin, [{ filename, template }]);
  }
};

export default legacy_HTML;
