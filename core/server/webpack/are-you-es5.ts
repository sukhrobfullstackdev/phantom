/*
  This modules is based on the `are-you-es5` NPM package, with the following
  changes:

    - Remove the configurable stuff; instead we just baked-in what we need.

    - If a dependency has a `package.json#module` field, we assume ES6+

    - We give the `package.json#browser` and `package.json#module` fields
      precedence over `package.json#main`. This mirrors Webpack's default
      behavior.

    - if `package.json#browser` is present and NOT a string, we assume ES6+
      (this is not 100% accurate, but that's okay because we aren't optimizing
      for accuracy here, we just need to know what MAYBE needs to be
      babel-ified).

  @source https://github.com/obahareth/are-you-es5
 */

/*
  eslint-disable

  @typescript-eslint/no-var-requires,
  import/no-dynamic-require,
  global-require
*/

import path from 'path';
import acorn from 'acorn';
import { isString, uniq, flatten } from '~/app/libs/lodash-utils';
import { readdirSync, readFileSync, lstatSync } from 'fs';
import { resolveToRoot } from '../libs/path-utils';

/**
 * Create a Regexp that includes a list of dependencies
 */
export function buildIncludeRegexp(dependencies: string[]) {
  const crossEnvSlash = '[\\/]';
  const nodeModules = `${crossEnvSlash}node_modules${crossEnvSlash}`;
  const escape = (dep: string) => dep.replace('/', '\\/');
  return new RegExp(`${nodeModules}?(${dependencies.map(escape).join('|')})${crossEnvSlash}`);
}

/**
 * Gets all root-level NPM dependencies in a flattened, de-duped array.
 */
function getAllNodeModules(): string[] {
  const nodeModulesPath = resolveToRoot('node_modules');

  const isDirectory = (source: string) => lstatSync(source).isDirectory();

  const getDirectories = (source: string) => {
    return readdirSync(source)
      .map(name => path.join(source, name))
      .filter(isDirectory);
  };

  const getLeafFolderName = (fullPath: string) => {
    const needle = `node_modules${path.sep}`;
    const indexOfLastSlash = fullPath.lastIndexOf(needle);
    return fullPath.substr(indexOfLastSlash + needle.length);
  };

  let modules = getDirectories(nodeModulesPath)
    .filter(entry => {
      const leafFolderName = getLeafFolderName(entry);
      return !leafFolderName.startsWith('.');
    })
    .map(entry => {
      // If this is a scope (folder starts with @), return all
      // folders inside it (scoped packages)
      if (/@.*$/.test(entry)) return getDirectories(entry);
      return entry;
    });

  // Remove path from all strings
  // e.g. turn bla/bla/node_modules/@babel/core
  // into @babel/core
  modules = flatten(modules)
    .map(entry => getLeafFolderName(entry))
    .filter(dep => !/(babel|webpack)|(loader$)/.test(dep));

  return uniq(modules as string[]).sort();
}

/**
 * Returns `true` if the given `dependencyName` is LIKELY to be ES5-compatible.
 *
 * There are no 100% guarantees here, so if a particular dependency appears to
 * be ES5, but should still be processed through `babel`, then be sure to add it
 * to the `includeNodeModulesFromBabelLoader` array in `webpack.yaml`.
 */
function isES5(dependencyName: string) {
  const packageJson = require(`${dependencyName}/package.json`);

  // If the `package.json#module` field is present, we assume ES6+
  if (packageJson.module) return false;

  let scriptPath: string;

  if (packageJson.browser) {
    // If the `package.json#browser` field is present and a string, we'll check
    // against that instead of the usual `package.json#main` field...
    if (isString(packageJson.browser)) scriptPath = packageJson.browser;
    // Otherwise, if `package.json#browser` is not a string (thus, an object),
    // we give up and assume it's ES6+ (we don't need 100% accuracy here)...
    else return false;
  } else {
    // This will resolve to the `package.json#main` field.
    scriptPath = require.resolve(dependencyName);
  }

  // TODO: Check all scripts this script requires/imports
  // @see https://github.com/obahareth/are-you-es5/issues/2
  const acornOpts: acorn.Options = { ecmaVersion: 5 };
  const code = readFileSync(scriptPath, 'utf8');

  try {
    acorn.parse(code, acornOpts);
  } catch (e) {
    return false;
  }

  return true;
}

/**
 * Tries to find and categorize ES5 & ES6+ NPM dependencies.
 */
export function checkModules() {
  const packageJson = require(resolveToRoot('package.json'));
  const dependencies = uniq([...Object.keys(packageJson.dependencies), ...getAllNodeModules()]) ?? [];

  const es5Modules: string[] = [];
  const es6Modules: string[] = [];
  const ignored: string[] = [];

  dependencies.forEach(dependency => {
    try {
      if (isES5(dependency)) es5Modules.push(dependency);
      else es6Modules.push(dependency);
    } catch (e) {
      ignored.push(dependency);
    }
  });

  return { es5Modules, es6Modules, ignored };
}
