import { ServerCookies, ServerSignedCookies } from '~/shared/constants/cookies';
import { IncomingAuthRelayerHeaders } from '~/server/constants/allowed-headers';

interface RequestExtensions {
  cookies: ServerCookies;
  signedCookies: ServerSignedCookies;
  headers: IncomingAuthRelayerHeaders;
  currentError?: Error;
  proxyDetails: {
    target?: string;
  };
}

interface ResponseExtensions {
  nonce: string;
}

declare module 'express' {
  /*
    ESLint's `import` plugin complains with `import/no-unresolved` when we use
    the following type declarations from `express-serve-static-core`. To silence
    the linter errors without totally disabling that (very important) rule, we
    replicate them here as exports from the base `express` module.

    This is a total hack, but it works marvelously.
   */

  export interface ParamsDictionary {
    [key: string]: string;
  }

  export type ParamsArray = string[];
  export type Params = ParamsDictionary | ParamsArray;
}

declare module 'express-serve-static-core' {
  interface Request {
    ext: RequestExtensions;
  }

  interface Response {
    ext: ResponseExtensions;
  }

  // Overload `CookieOptions` with parameters accepted by `cookie-encrypter`.
  interface CookieOptions {
    /**
     * If `true`, the cookie will not be encrypted by the `cookie-encrypter`
     * middleware (default: `false`).
     */
    plain?: boolean;
  }
}

declare module 'http' {
  interface IncomingHttpHeaders extends IncomingAuthRelayerHeaders {}
}
