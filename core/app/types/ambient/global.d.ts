import type { ClientSideFeatureManifestData } from '~/features/framework';

/** Global type extensions and shims. */
declare global {
  export interface Window {
    // RN
    ReactNativeWebView: {
      postMessage: (s: string) => any;
    };

    recaptchaOnLoad: () => any;

    // IOS Native
    webkit: any;
    analytics: any;
    init_analytics: any;
    devToolsExtension?: () => any;

    // Feature metadata
    __auth_relayer_manifest__?: ClientSideFeatureManifestData;

    // datadog
    magic?: Record<string, { timeReceived: number; method?: string }>;
    trace_id?: string;
  }

  // Webpack
  export function __webpack_require__(moduleID: string): any;
  export const __webpack_modules__: { [key: string]: any };

  export interface NodeRequire {
    context: (
      directory: string,
      includeSubdirs?: boolean,
      filter?: RegExp,
      mode?: 'sync' | 'eager' | 'weak' | 'lazy' | 'lazy-once',
    ) => {
      keys: () => string[];
      resolve: (path: string) => string;
    };

    resolveWeak: (path: string) => string;
  }
}

export default global;
