import path from 'path';
import { LoadedFeatureModule, ServerFeatureModuleType } from '~/features/framework';
import { IS_NODE_ENV_DEV } from '~/shared/constants/env';
import { resolveToRoot } from './path-utils';
import type { FeatureName } from '~/features/manifest';

type FeatureModuleIDResolvers = Record<
  ServerFeatureModuleType,
  (featureName: FeatureName, modulePath?: string) => string
>;

const featureModuleIDResolvers: FeatureModuleIDResolvers = {
  API: (featureName, modulePath) => `~/features/${featureName}/_api/${modulePath}`,
};

export function loadFeature(
  featureName: FeatureName,
  moduleType: 'API',
  modulePath: string,
): Promise<LoadedFeatureModule<'API'>>;

export async function loadFeature(
  featureName: FeatureName,
  moduleType: ServerFeatureModuleType,
  modulePath: string,
): Promise<LoadedFeatureModule<ServerFeatureModuleType>> {
  const resolveModuleID = featureModuleIDResolvers[moduleType];
  const featureModuleID = resolveModuleID(featureName, modulePath);

  if (IS_NODE_ENV_DEV && moduleType === 'API') {
    // During development, we freshly require API feature modules that we get
    // the latest changes without needing to restart the server.
    clearModule(featureModuleID);
  }

  return import(featureModuleID);
}

/**
 * Resolve a filename from the given `moduleId` using Node's `require.resolve`.
 */
function resolve(moduleId: string) {
  try {
    if (path.isAbsolute(moduleId)) return moduleId;
    return require.resolve(moduleId);
  } catch {}
}

/**
 * Remove the module given by `moduleId` from Node's `require.cache`.
 */
function clearModule(moduleId: string) {
  const filePath = resolve(moduleId);

  if (!filePath) return;

  // Delete itself from module parent
  if (require.cache[filePath] && require.cache[filePath]?.parent) {
    let i = require.cache[filePath]!.parent!.children.length;

    while (i--) {
      if (require.cache[filePath]!.parent!.children[i].id === filePath) {
        require.cache[filePath]!.parent!.children.splice(i, 1);
      }
    }
  }

  if (require.cache[filePath]) {
    const children = [...require.cache[filePath]!.children];

    // Delete module from cache
    delete require.cache[filePath];

    // Remove all descendants from cache as well,
    // excluding core code and node_modules.
    const coreCode = new RegExp(`^${resolveToRoot('src', 'server')}`);
    const nodeModule = /[\\/]node_modules[\\/]/;
    for (const { id } of children) {
      if (!coreCode.test(id) && !nodeModule.test(id)) {
        clearModule(id);
      }
    }
  }
}
