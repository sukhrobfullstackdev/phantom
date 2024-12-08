import { RawThemeConfig } from '../types/theme';
import { OAuthClientMetadata, OAuthServerMetadata } from '~/features/oauth/types/oauth-metadata';
import { KnownKeys } from '../types/utility-types';
import { MfaFactors } from '~/app/services/authentication/mfa-types';

export const REFRESH_TOKEN_COOKIE = '_aurt';
export const CSRF_TOKEN_COOKIE = '_aucsrf';
export const OAUTH_CLIENT_META_COOKIE = '_oaclientmeta';
export const OAUTH_SERVER_META_COOKIE = '_oaservermeta';
export const OAUTH_REQUEST_ID_COOKIE = '_oarid';
export const CUSTOM_THEME_COOKIE = '_ct';
export const LOGIN_FLOW_CONTEXT_COOKIE = '_lfc';
export const MFA_FACTORS_REQUIRED_COOKIE = '_mfafr';
export const OAUTH_MOBILE_BUNDLE_ID = '_bundleId';

/**
 * An interface of client cookies we expect `document.cookie` to contain.
 *
 * NOTE: these cookies should be marked as
 * `httpOnly: false`, `signed: false`, and `plain: true`
 */
export type ClientCookies = Partial<{
  _aucsrf: string;
  _ct: RawThemeConfig;
  _oaclientmeta: OAuthClientMetadata;
  _lfc: string;
  _mfafr: MfaFactors;
  _bundleId?: string;
  [key: string]: any;
}>;

/**
 * An interface of unsigned server cookies we expect to be able to parse.
 *
 * NOTE: these cookies should be marked as
 * `httpOnly: true`, `signed: false`, and `plain: true|false`
 */
export interface ServerCookies
  extends ClientCookies,
    Partial<{
      [key: string]: any;
    }> {}

/**
 * An interface of signed server cookies we expect to be able to parse.
 *
 * NOTE: these cookies should be marked as
 * `httpOnly: true`, `signed: true`, and `plain: true|false`
 */
export type ServerSignedCookies = Partial<{
  _aurt: string;
  _oaservermeta: OAuthServerMetadata;
  _oarid: string;
  [key: string]: any;
}>;

export type CookieName = KnownKeys<ServerSignedCookies> | KnownKeys<ServerCookies>;

export type CookieType<T extends CookieName> = T extends KnownKeys<ServerSignedCookies>
  ? ServerSignedCookies[T]
  : T extends KnownKeys<ServerCookies>
  ? ServerCookies[T]
  : never;
