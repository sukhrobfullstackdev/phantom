import { DefinePlugin } from 'webpack';
import { CONFIG_YAML, publicPath } from '../../../webpack-utils';
import { ConfigModifier } from '../../types';

/**
 * Inject environment variables into static Webpack bundles.
 */
const environment: ConfigModifier = ({ config, isLegacyBundle }) => {
  const { env } = CONFIG_YAML;

  const definitions = {
    ...Object.fromEntries(env.map(envKey => [envKey, process.env[envKey]])),
    IS_LEGACY_BUNDLE: Number(isLegacyBundle),
    PUBLIC_PATH: publicPath,
  };

  config.plugin('environment').use(DefinePlugin, [
    {
      ...Object.fromEntries(
        Object.entries(definitions).map(([key, value]) => [`process.env.${key}`, JSON.stringify(value)]),
      ),
    },
  ]);
};

export default environment;
