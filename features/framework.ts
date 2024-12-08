import type { RequestHandler, ErrorRequestHandler } from 'express';
import type { RpcRouteConfig } from '~/app/rpc/utils/rpc-router';
import type { RawThemeConfig } from '~/shared/types/theme';
import type { Awaited, NoExtraProperties } from '~/shared/types/utility-types';
import type { FeatureName } from './manifest';
import { Locale } from '~/app/libs/i18n/supported-locales';

// --- Feature module types

export type AsyncFeatureModule<T = any> = () => Promise<{ default?: T }>;

type API = AsyncFeatureModule<{
  [P in 'all' | 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head']?:
    | RequestHandler<any>
    | ErrorRequestHandler<any>;
}>;

type RPC = AsyncFeatureModule<RpcRouteConfig>;

type Pages = AsyncFeatureModule<{
  render: React.FC;
  parseApiKey?: () => string;
  parseLocale?: () => Locale;
  parseTheme?: () => RawThemeConfig | undefined;
}>;

export interface Feature<_API extends API = API, _RPC extends RPC = RPC, _Pages extends Pages = Pages> {
  API?: _API;
  RPC?: _RPC;
  Pages?: _Pages;
}

export type ClientSideFeatureManifestData = {
  features: {
    [P in FeatureName]: {
      chunks: string[];
      pages: Record<string, string>;
      rpc: Record<string, string>;
    };
  };
};

export interface BuildTimeFeatureManifestData extends ClientSideFeatureManifestData {
  preloadAsyncChunks: string[];
  mainChunks: string[];
}

export type Framework<T extends FeatureModuleType> = NonNullable<
  Awaited<ReturnType<NonNullable<Feature[T]>>>['default']
>;

export type FeatureModuleType = keyof Feature;
export type ServerFeatureModuleType = keyof Pick<Feature, 'API'>;
export type ClientFeatureModuleType = keyof Pick<Feature, 'RPC' | 'Pages'>;
export type LoadedFeatureModule<T extends FeatureModuleType = FeatureModuleType> = Awaited<
  ReturnType<NonNullable<Feature[T]>>
>;

// --- Feature module factories

/**
 * This produces a factory function that just returns its arguments as-is.
 * The purpose is to enable strong type inference and enforce good patterns.
 */
const createFeatureModuleFactory =
  <T extends FeatureModuleType>() =>
  <P extends Framework<T>>(mod: NoExtraProperties<Framework<T>, P>) =>
    mod;

export const createFeatureModule = {
  API: createFeatureModuleFactory<'API'>(),
  RPC: createFeatureModuleFactory<'RPC'>(),
  Page: createFeatureModuleFactory<'Pages'>(),
};
