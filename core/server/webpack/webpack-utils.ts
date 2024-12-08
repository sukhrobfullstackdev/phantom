/* eslint-disable @typescript-eslint/restrict-plus-operands */

import { URL } from 'url';
import { memoize } from '~/app/libs/lodash-utils';
import { exists as existsCallback, readFile as readFileCallback } from 'fs';
import { promisify } from 'util';
import { IS_NODE_ENV_DEV } from '~/shared/constants/env';
import { ASSETS_BASE_URL } from '../constants/env';
import { parseYAML } from '../libs/parse-yaml';
import { recursiveReadDir, resolveToRoot } from '../libs/path-utils';
import { EnabledFeatures } from '~/features/manifest';
import { filterValidPages } from '../libs/feature-framework/route-mapping';
import { BuildTimeFeatureManifestData } from '~/features/framework';

export const CONFIG_YAML = parseYAML<{
  env: string[];
  babel: {
    excludeNodeModules: string[];
    includeNodeModules: string[];
  };
  legacyBundleModuleReplacements: { [key: string]: string };
  localChunks: { [key: string]: string[] };
  preloadLocalChunks: string[];
  vendorChunks: { [key: string]: string[] };
  preloadVendorChunks: string[];
}>(resolveToRoot('./core/server/webpack/webpack.yaml'));

export const publicPath = ASSETS_BASE_URL ? new URL('/static/', ASSETS_BASE_URL).href : '/__local_dev__/';

export type BundleName = 'app' | 'app.legacy';
export type LegacyBundle = 'app.legacy';

export const regExps = {
  nodeModule: /[\\/]node_modules[\\/]/,
  nodeModulePackageName: /(?<!node_modules.*)[\\/]node_modules[\\/]((?:@([^/]+?)[/])?([^/]+?))([\\/]|$)/,
  warningFilter: /(node_modules[\\/]source-map-loader[\\/]index|export .* was not found in)/,

  loaders: {
    styles: /\.(css|less)$/i,
    scripts: /\.(js|jsx|ts|tsx)$/i,
    files: /\.(woff(2)?|ttf|otf|eot|svg|png|jpe?g|gif)(\?v=\d+\.\d+\.\d+)?$/,
  },
};

/**
 * Format a hashed, Webpack-interpretable output filename
 * based on the current environment.
 */
export function formatFilename(
  name: BundleName,
  options?: {
    filename?: string;
    hash?: '[contenthash]' | '[chunkhash]' | '[hash]';
    ext?: '[ext]' | 'js' | 'css';
  },
) {
  const filename = options?.filename ?? '[name]';
  const hash = options?.hash ?? '[contenthash]';
  const ext = options?.ext ?? '[ext]';

  return IS_NODE_ENV_DEV ? `${name}.${filename}.${ext}` : `${name}.${filename}.${hash}.${ext}`;
}

/**
 * Returns a mapping of all enabled feature entries
 * to be dynamically injected into our Webpack config.
 */
export async function getFeatureEntries() {
  const result = {};

  await Promise.all(
    EnabledFeatures.map(async featureName => {
      const [rpcEntries, pageEntries] = await Promise.all([
        recursiveReadDir(resolveToRoot(`./features/${featureName}/_rpc`)),
        recursiveReadDir(resolveToRoot(`./features/${featureName}/_pages`)),
      ]);

      const paths = [...rpcEntries, ...filterValidPages(pageEntries)];

      paths.forEach(p => {
        if (!result[featureName]) result[featureName] = [];
        result[featureName].push(p);
      });
    }),
  );

  return result;
}

const exists = promisify(existsCallback);
const readFile = promisify(readFileCallback);

/**
 * Parse feature metadata for the given `entry` and `target`.
 */
export const readBuildManifest = memoize(async (target: 'modern' | 'legacy' = 'modern') => {
  const pathToModernManifestJSON = resolveToRoot('.build-artifacts', `app.manifest.json`);
  const pathToLegacyManifestJSON = resolveToRoot('.build-artifacts', `app.legacy.manifest.json`);

  const [modernManifestExists, legacyManifestExists] = await Promise.all([
    exists(pathToModernManifestJSON),
    exists(pathToLegacyManifestJSON),
  ]);

  let json: string;

  if (modernManifestExists || legacyManifestExists) {
    const targets = {
      modern: modernManifestExists ? pathToModernManifestJSON : '',
      legacy: legacyManifestExists ? pathToLegacyManifestJSON : '',
    };

    const fallback = target === 'modern' ? 'legacy' : 'modern';

    json = await readFile(targets[target] || targets[fallback], { encoding: 'utf-8' });
  } else {
    const emptyManifest: BuildTimeFeatureManifestData = {
      preloadAsyncChunks: [],
      mainChunks: [],
      features: {} as any,
    };

    json = JSON.stringify(emptyManifest);
  }

  const parsed = JSON.parse(json) as BuildTimeFeatureManifestData;
  json = JSON.stringify({ features: parsed.features });

  return { json, parsed };
});
