import FilterWarningsPlugin from 'webpack-filter-warnings-plugin';
import { regExps } from '../../../webpack-utils';
import { ConfigModifier } from '../../types';

/**
 * Inject additional plugins into Webpack configuration.
 */
const filterWarnings: ConfigModifier = ({ config }) => {
  // Some node_modules have not correctly distributed their sourcemaps, causing
  // Webpack to raise a superfluous warning. We silence these warnings using
  // the `FilterWarningsPlugin`.
  config.plugin('filter-warnings').use(FilterWarningsPlugin, [{ exclude: regExps.warningFilter }]);
};

export default filterWarnings;
