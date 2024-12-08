import ForkTsCheckerNotifierWebpackPlugin from 'fork-ts-checker-notifier-webpack-plugin';
import minimatch from 'minimatch';
import { NormalModuleReplacementPlugin } from 'webpack';
import { resolveToRoot } from '~/server/libs/path-utils';
import { buildIncludeRegexp, checkModules } from '../../../are-you-es5';
import { CONFIG_YAML, regExps } from '../../../webpack-utils';
import { ConfigModifier } from '../../types';

/**
 * Configure Webpack to consume JS/JSX/TS/TSX files.
 */
const scripts: ConfigModifier = ({ name, config, isLegacyBundle, isDevelopment }) => {
  const configFile = resolveToRoot('tsconfig.json');

  const babelConfig = {
    presets: [
      [
        '@babel/preset-env',
        {
          corejs: { version: 3 },
          useBuiltIns: 'entry',
          bugfixes: true,
          targets: isLegacyBundle ? { ie: '11' } : { esmodules: true },
        },
      ],

      '@babel/preset-react',
    ],

    compact: true,

    plugins: [isDevelopment && require.resolve('react-refresh/babel')].filter(Boolean),
  };

  /* eslint-disable prettier/prettier */
  const compileScripts = config.module
    .rule('compile-scripts')
    .test(regExps.loaders.scripts)
    .include.add(resolveToRoot('core'))
    .add(resolveToRoot('features'))
    .end()
    .use('babel')
    .loader('babel-loader')
    .options(babelConfig)
    .end()
    .use('typescript')
    .loader('ts-loader')
    .options({ configFile, transpileOnly: true })
    .end();
  /* eslint-enable prettier/prettier */

  if (isLegacyBundle) {
    const { babel } = CONFIG_YAML;
    const { es6Modules, es5Modules, ignored } = checkModules();

    const includeModules = [
      // Filter out any explicitly EXCLUDED modules.
      ...es6Modules.filter(i => {
        return babel.excludeNodeModules.every(pattern => !minimatch(i, pattern));
      }),

      // Add-in any explicitly INCLUDED modules.
      ...[...es5Modules, ...ignored].filter(i => {
        return babel.includeNodeModules.every(pattern => minimatch(i, pattern));
      }),
    ];

    // Build a RegExp pattern that Webpack's
    // loader configuration can understand.
    const includePattern = buildIncludeRegexp(includeModules);

    /* eslint-disable prettier/prettier */
    compileScripts.include.add(includePattern);
    /* eslint-enable prettier/prettier */

    // Replace certain modules in the legacy
    // bundle as a compatibility affordance.
    const { legacyBundleModuleReplacements } = CONFIG_YAML;
    Object.entries(legacyBundleModuleReplacements).forEach(([dep, replacement]) => {
      config
        .plugin(`replace:${dep}`)
        .use(NormalModuleReplacementPlugin, [new RegExp(`^${dep}$`), resolveToRoot(replacement)]);
    });
  } else if (isDevelopment) {
    // We use `ForkTsCheckerWebpackPlugin` plugin to perform type-checking in
    // a separate process (asynchronously during development). This greatly
    // reduces the performance impact of TypeScript transpilation, so we can
    // get up and running a lot faster!
    // config.plugin('typechecker').use(ForkTsCheckerWebpackPlugin, [
    //   {
    //     typescript: { configFile },
    //     logger: {
    //       infrastructure: 'silent',
    //       issues: {
    //         error: message => console.log(`\n${message}\n`),
    //         info: message => console.log(`${chalk.gray(`[type-checker]`)} ${message}`),
    //         log: message => console.log(`${chalk.gray(`[type-checker]`)} ${message}`),
    //       },
    //       devServer: isDevelopment,
    //     },
    //     async: isDevelopment,
    //   },
    // ]);

    // Because `ForkTsCheckerWebpackPlugin` works in a separate child process,
    // we like to be notified when it's finished working (so we can check our
    // console for detailed type errors, if necessary). This plugin enables a
    // native OS notification to emit when the type-checker is finished working.
    config.plugin('typechecker-notifier').use(ForkTsCheckerNotifierWebpackPlugin, [
      {
        title: `TypeScript: ${name}`,
        excludeWarnings: true,
      },
    ]);
  }
};

export default scripts;
