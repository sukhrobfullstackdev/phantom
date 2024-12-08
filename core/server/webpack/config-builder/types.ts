import type Config from 'webpack-chain';
import type { Configuration as WebpackConfiguration } from 'webpack';
import { BundleName } from '../webpack-utils';

export interface ConfigModifierContext {
  name: BundleName;
  config: Config;
  isLegacyBundle: boolean;
  isDevelopment: boolean;
  isProduction: boolean;
  isAnalysisMode: boolean;
  isStaticDeployment: boolean;
}

export type ConfigModifier = (ctx: ConfigModifierContext) => void | Promise<void>;
export type ConfigPostProcessor = (config: WebpackConfiguration, ctx: ConfigModifierContext) => void | Promise<void>;
