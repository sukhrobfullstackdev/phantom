import TerserPlugin from 'terser-webpack-plugin';
import crypto from 'crypto';
import minimatch from 'minimatch';
import os from 'os';
import { EnabledFeatures } from '~/features/manifest';
import { CONFIG_YAML, regExps } from '../../../webpack-utils';
import { ConfigModifier } from '../../types';
import { resolveToRoot } from '~/server/libs/path-utils';

/**
 * Returns `true` if the given `mod` is a CSS-type Webpack module.
 */
function isModuleCSS(mod: { type: string }): boolean {
  return (
    // mini-css-extract-plugin
    mod.type === `css/mini-extract` ||
    // extract-css-chunks-webpack-plugin (old)
    mod.type === `css/extract-chunks` ||
    // extract-css-chunks-webpack-plugin (new)
    mod.type === `css/extract-css-chunks`
  );
}

/**
 * Generate a chunk group name based on `chunkConfig`, which matches
 * group names (as keys) to glob patterns of source paths (as values).
 */
function getChunkGroupName(chunkConfig: { [key: string]: string[] }, resource: string | undefined) {
  return Object.entries(chunkConfig).find(([_, deps]) => {
    try {
      return deps.find(d => minimatch(resource!, d));
    } catch {
      return false;
    }
  })?.[0];
}

/**
 * Returns true if the given `entry` matches any of the given `chunks`.
 */
function filterByEntryPoint(entry: string, chunks: any[]) {
  if (chunks.map(c => c.entryModule?.name).includes(entry)) return true;

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];

    if (chunk.groupsIterable) {
      for (const group of chunk.groupsIterable) {
        if (group.getParents()[0] && group.getParents()[0].name === entry) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Creates a hash of common entry points for the
 * given `mod` (a Webpack module) and its `chunks`.
 *
 * We use this to determine which entry points are common between
 * imported modules to better implement code-splitting.
 */
function getEntryPointHash(mod: any, chunks: any[], isAnalysisMode: boolean) {
  const entryPoints: string[] = [];

  if (filterByEntryPoint('pre', chunks)) {
    entryPoints.push('pre');
  } else if (filterByEntryPoint('main', chunks)) {
    entryPoints.push('main');
  } else {
    EnabledFeatures.forEach(feature => {
      if (filterByEntryPoint(feature, chunks)) {
        entryPoints.push(feature);
      }
    });
  }

  // In analysis mode, we don't want to obfuscate the chunk name with a hash.
  if (isAnalysisMode) {
    return entryPoints.join(':') + (isModuleCSS(mod) ? '_CSS' : '');
  }

  return crypto
    .createHash('md5')
    .update(entryPoints.join(':') + (isModuleCSS(mod) ? '_CSS' : ''))
    .digest('hex');
}

/**
 * Creates a function implementing our split chunks strategy.
 */
function getSplitChunksNameFn(isAnalysisMode: boolean) {
  return (mod: any, chunks: any[]) => {
    const suffix = chunks.every(chunk => chunk.canBeInitial()) ? '' : '~async';
    const entryPointHash = getEntryPointHash(mod, chunks, isAnalysisMode);

    // 1 - Handle node_modules

    if (mod.context?.match(regExps.nodeModulePackageName)?.[1]) {
      // 1.1 - Check if the resource is explicitly grouped in `webpack.yaml#vendorChunks`
      const vendorChunkGroup = getChunkGroupName(
        CONFIG_YAML.vendorChunks,
        mod.context?.match(regExps.nodeModulePackageName)?.[1],
      );

      if (vendorChunkGroup) {
        return `chunk~vendor~${vendorChunkGroup}${suffix}`;
      }

      // 1.2 - For smaller NPM dependencies, group by a common entry hash
      if (mod.size() < 70000 || !mod.libIdent) {
        return `chunk~vendor~${entryPointHash}${suffix}`;
      }

      // 1.3 - For larger NPM dependencies, split the dependency into it's own chunk
      const dependencyHash = crypto.createHash('md5');

      if (isModuleCSS(mod)) {
        mod.updateHash(dependencyHash);
      } else {
        dependencyHash.update(mod.libIdent({ context: process.cwd() }));
      }

      return `chunk~vendor~${dependencyHash.digest('hex')}${suffix}`;
    }

    // 2 - Handle local modules

    // 2.1 - Check if the resource is explicitly grouped in `webpack.yaml#localChunks`
    const appChunkGroupDefinitions = Object.fromEntries(
      Object.entries(CONFIG_YAML.localChunks).map(([groupName, deps]) => [groupName, deps.map(d => resolveToRoot(d))]),
    );

    const appGroup = getChunkGroupName(appChunkGroupDefinitions, mod.userRequest ?? mod.issuer?.userRequest);

    if (appGroup) {
      return `chunk~${appGroup}${suffix}`;
    }

    // 2.2 - For all other cases, group by a common entry hash
    return `chunk~${entryPointHash}${suffix}`;
  };
}

/**
 * Extract modules into separate, code-split Webpack bundles.
 */
const optimization: ConfigModifier = ({ config, isProduction, isDevelopment, isAnalysisMode }) => {
  const splitChunksDev = {
    cacheGroups: { default: false, vendors: false },
  };

  const splitChunksProd = {
    chunks: 'all',
    cacheGroups: {
      default: false,
      vendors: false,
      all: {
        priority: 1,
        enforce: true,
        name: getSplitChunksNameFn(isAnalysisMode),
      },
    },
  };

  // --- Webpack optimization settings

  config.optimization
    .minimize(isProduction)
    .removeAvailableModules(isProduction)
    .removeEmptyChunks(isProduction)
    .mergeDuplicateChunks(false)
    .splitChunks(isProduction ? splitChunksProd : splitChunksDev)
    .runtimeChunk('single');

  // Custom Terser instance
  // We disable caching in production because
  // it's unnecessary and time-consuming.
  config.optimization.minimizer('terser').use(TerserPlugin, [
    {
      parallel: os.cpus().length - 1, // Reserve one for `ForkTsCheckerWebpackPlugin`,
      cache: isDevelopment,
      terserOptions: {
        compress: false,
      },
    },
  ]);
};

export default optimization;
