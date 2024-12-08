import { getThemeVariables, DEFAULT_THEME } from '@magiclabs/ui';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import OptimizeCssAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import postcssPresetEnv from 'postcss-preset-env';
import postcssCustomProperties from 'postcss-custom-properties';
import type webpack from 'webpack';
import path from 'path';
import crypto from 'crypto';
import cssEscape from 'css.escape';
import { resolveToRoot } from '~/server/libs/path-utils';
import { regExps, formatFilename } from '../../../webpack-utils';
import { ConfigModifier } from '../../types';

/**
 * Generates a minimal, scoped classname for CSS modules. We use this in
 * production to further optimize (and obfuscate) stylesheets in production.
 */
export function createScopedClassnameGenerator(isProduction: boolean) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const nextID: number[] = [0];
  const cache = new Map<string, string>();

  const next = () => {
    const r: string[] = [];
    for (const char of nextID) {
      r.unshift(charset[char]);
    }
    increment();
    return r.join('');
  };

  const increment = () => {
    for (let i = 0; i < nextID.length; i++) {
      const val = ++nextID[i];
      if (val >= charset.length) {
        nextID[i] = 0;
      } else {
        return;
      }
    }
    nextID.push(0);
  };

  return (context: webpack.loader.LoaderContext, _: any, exportName: string) => {
    // Create a unique hash based on the resource path and local classname ("exportName").
    const relativePath = path.relative(context.rootContext, context.resourcePath).replace(/\\+/g, '/');
    const hash = crypto.createHash('md5').update(`filePath:${relativePath}#className:${exportName}`).digest('hex');

    // If we've seen this hash before, return the cached classname...
    if (cache.has(hash)) {
      return cache.get(hash);
    }

    const { name: basename } = path.parse(relativePath);

    // Generate a very minimal classname,
    // then cache it based on the generated hash.
    const scopedName = isProduction ? `_${next()}` : `_${basename}_${exportName}_${hash.substr(0, 8)}`;
    cache.set(hash, scopedName);
    return cssEscape(scopedName);
  };
}

/**
 * Configure Webpack to consume CSS/LESS files.
 */
const styles: ConfigModifier = ({ name, config, isLegacyBundle, isDevelopment, isProduction }) => {
  /* eslint-disable prettier/prettier */
  const compileStyles = config.module.rule('compile-styles')
    .test(regExps.loaders.styles)
    .use('css')
      .loader('css-loader')
      .options({
        sourceMap: !isLegacyBundle,
        // Use CJS mode for backwards compatibility:
        esModule: false,
        url: (url: string) =>!url.startsWith('/'),
        import: (url: string) =>!url.startsWith('/'),
        importLoaders: 2, // `postcss-loader` + `less-loader`
        modules: {
           // Do not transform class names (CJS mode backwards compatibility):
          exportLocalsConvention: 'asIs',
          // Disallow global style exports so we can code-split CSS and
          // not worry about loading order.
          mode: 'pure',
          // Exclude LESS entry point & node_modules from CSS modularization.
          auto: (resourcePath: string) => {
            const isEntryPoint = resourcePath === resolveToRoot('core', 'app', 'index.less');
            const isNodeModule = regExps.nodeModule.test(resourcePath);
            return !isEntryPoint && !isNodeModule;
          },
          getLocalIdent: createScopedClassnameGenerator(isProduction),
        },
      })
      .end()
    .use('postcss')
      .loader('postcss-loader')
      .options({
        sourceMap: !isLegacyBundle,
        plugins: () => [
          postcssPresetEnv({ stage: 0 }),
          postcssCustomProperties({
            importFrom: [{ customProperties: getThemeVariables(DEFAULT_THEME).variables }],
          })
        ],
      })
      .end()
    .use('less')
      .loader('less-loader')
      .options({
        sourceMap: !isLegacyBundle,
        lessOptions: { paths: [resolveToRoot('node_modules')] }
      })
      .end();
  /* eslint-enable prettier/prettier */

  if (isDevelopment) {
    // In development, we render CSS inline.
    /* eslint-disable prettier/prettier */
    compileStyles
      .use('inline-styles')
        .loader('style-loader')
        .before('css')
        .end();
    /* eslint-enable prettier/prettier */
  } else {
    // In production, we extract CSS to a separate file.
    /* eslint-disable prettier/prettier */
    compileStyles
      .use('extract-css')
        .loader(MiniCssExtractPlugin.loader)
        .before('css')
        .end();
    /* eslint-enable prettier/prettier */

    config.plugin('extract-css').use(MiniCssExtractPlugin, [{ filename: formatFilename(name, { ext: 'css' }) }]);
    config.plugin('optimize-css').use(OptimizeCssAssetsPlugin);
  }
};

export default styles;
