import { ConfigModifier } from '../../types';

// Plugins
import { FeatureFrameworkPlugin } from '../../../plugins/feature-framework-plugin';
import { ReportChangedFilesPlugin } from '../../../plugins/report-changed-files-plugin';

/**
 * Inject additional plugins into Webpack configuration.
 */
const customPlugins: ConfigModifier = ({ name, config, isLegacyBundle }) => {
  config.plugin('feature-framework').use(FeatureFrameworkPlugin, [name]);
  config.plugin('report-changed-files').use(ReportChangedFilesPlugin, []);
};

export default customPlugins;
