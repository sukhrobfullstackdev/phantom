import { SourceMapDevToolPlugin, EvalSourceMapDevToolPlugin } from 'webpack';
import { ConfigModifier } from '../../types';

/**
 * Apply source-map generation settings to Webpack configuration.
 */
const sourceMap: ConfigModifier = ({ config, isLegacyBundle, isDevelopment, isProduction, isAnalysisMode }) => {
  if (!isLegacyBundle) {
    // We disable the `devtool` option so that
    // we may customize it granularly instead.
    config.devtool(false);

    // Same as: https://github.com/webpack/webpack/blob/a73bcc5042e0c49661ad34ba10ec4d3f07691558/lib/config/defaults.js#L700
    const defaultSourceMapFilename = '[file].map[query]';

    // Functionally equivalent to `devtool: "eval-source-map"`
    // Inferred from: https://github.com/webpack/webpack/blob/766be5a3fd541cda675ad800bbdfcc8d7144b8d3/lib/WebpackOptionsApply.js#L199
    const evalSourceMap: SourceMapDevToolPlugin.Options = {
      filename: defaultSourceMapFilename,
      module: true,
      columns: true,
      noSources: false,
    };

    // Functionally equivalent to `devtool: "hidden-source-map"`
    // Inferred from: https://github.com/webpack/webpack/blob/766be5a3fd541cda675ad800bbdfcc8d7144b8d3/lib/WebpackOptionsApply.js#L199
    const hiddenSourceMap: SourceMapDevToolPlugin.Options = {
      filename: defaultSourceMapFilename,
      module: true,
      columns: true,
      noSources: false,
      append: false,

      // We explicitly exclude vendor chunks (node_modules) from generating
      // source-maps to save on performance. We generally care only about
      // source-maps that include references to local modules in the app.
      //
      // We might consider making this configurable in `webpack.yaml` someday.
      exclude: /vendor.+/,
    };

    config
      .plugin('custom-devtool')
      .use(isDevelopment ? EvalSourceMapDevToolPlugin : SourceMapDevToolPlugin, [
        isDevelopment ? evalSourceMap : hiddenSourceMap,
      ]);
  }
};

export default sourceMap;
