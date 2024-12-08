import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { ConfigModifier } from '../../types';

/**
 * The starting port given to `BundleAnalyzerPlugin`, this is incremented for
 * each additional compiler that's included in the bundle analysis.
 */
let analyzerPort = 8888;

/**
 * Configure Webpack to inspect bundle for performance analysis.
 * This will open a browser tab with a bundle visualization for
 * each compiler that's executing.
 */
const bundleAnalysis: ConfigModifier = ({ name, config, isLegacyBundle, isAnalysisMode }) => {
  if (isAnalysisMode) {
    const prettifiedName = isLegacyBundle ? `(Legacy)` : `(Modern)`;

    config.plugin('bundle-analyzer').use(BundleAnalyzerPlugin, [
      {
        reportTitle: prettifiedName,
        analyzerPort: analyzerPort++,
      },
    ]);
  }
};

export default bundleAnalysis;
