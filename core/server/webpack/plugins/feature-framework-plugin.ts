import { mkdirSync, writeFileSync } from 'fs';
import { isEmpty } from '~/app/libs/lodash-utils';
import path from 'path';
import { URL } from 'url';
import { Compiler } from 'webpack';
import { BuildTimeFeatureManifestData } from '~/features/framework';
import { EnabledFeatures } from '~/features/manifest';
import {
  createRouteToModulePathMapping,
  createRouteToModulePathPairings,
  getAllServerSideRoutes,
} from '~/server/libs/feature-framework/route-mapping';
import { resolveToRoot } from '~/server/libs/path-utils';
import { applyFeatureFrameworkRoutes } from '~/server/middlewares/feature-controller';
import { BundleName, CONFIG_YAML, publicPath, readBuildManifest } from '../webpack-utils';

/**
 * Filters sourcemaps and resolves entrypoint filenames to the build folder.
 */
function prepareChunks(entries: string[]) {
  return entries
    .filter(filename => !filename.endsWith('.map'))
    .map(filename =>
      publicPath === '/__local_dev__/' ? path.join(publicPath, filename) : new URL(filename, publicPath).href,
    );
}

/**
 * A custom Webpack plugin which emits a special `[name].manifest.json` file
 * containing information about the dependency tree of individual features
 * (which are code-split by default).
 */
export class FeatureFrameworkPlugin {
  static hookOptions = { name: 'FeatureFrameworkPlugin' };

  constructor(private readonly name: BundleName) {}

  apply(compiler: Compiler) {
    compiler.hooks.emit.tapAsync(FeatureFrameworkPlugin.hookOptions, async (compilation, callback) => {
      const mainEntries: string[] = compilation.entrypoints.get('main')?.getFiles() ?? [];

      const preloadAsyncChunks: string[] = Object.keys(compilation.assets).filter(file => {
        const matchesLocalPreloadChunk = !!CONFIG_YAML.preloadLocalChunks.find(groupName => {
          return file.startsWith(`${this.name}.chunk~${groupName}~async`);
        });

        const matchesVendorPreloadChunk = !!CONFIG_YAML.preloadVendorChunks.find(groupName => {
          return file.startsWith(`${this.name}.chunk~vendor~${groupName}~async`);
        });

        return matchesLocalPreloadChunk || matchesVendorPreloadChunk;
      });

      const metadata: BuildTimeFeatureManifestData = {
        preloadAsyncChunks: prepareChunks(preloadAsyncChunks),
        mainChunks: prepareChunks(mainEntries),
        features: {} as any,
      };

      const setupEnabledFeatures = EnabledFeatures.map(async featureName => {
        const featureEntries: string[] = compilation.entrypoints.get(featureName)?.getFiles() ?? [];

        const chunks = prepareChunks(featureEntries.filter(entry => !mainEntries.includes(entry)));
        const pages = await createRouteToModulePathMapping(featureName, '_pages');
        const rpc = await createRouteToModulePathMapping(featureName, '_rpc');

        if (!isEmpty(chunks) || !isEmpty(pages) || !isEmpty(rpc)) {
          metadata.features[featureName] = { chunks, pages, rpc };
        }
      });

      await Promise.all(setupEnabledFeatures);

      const manifestFilename = resolveToRoot('.build-artifacts', `${this.name}.manifest.json`);
      mkdirSync(path.dirname(manifestFilename), { recursive: true });
      writeFileSync(manifestFilename, JSON.stringify(metadata));

      callback();
    });

    compiler.hooks.watchRun.tapAsync(FeatureFrameworkPlugin.hookOptions, async (_, callback) => {
      // If a new framework module is added (pages, RPC, etc),
      // we need to cache bust our memoized helpers.
      createRouteToModulePathPairings.cache?.clear?.();
      createRouteToModulePathMapping.cache?.clear?.();
      getAllServerSideRoutes.cache?.clear?.();
      readBuildManifest.cache?.clear?.();

      await applyFeatureFrameworkRoutes();

      callback();
    });
  }
}
