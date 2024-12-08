/* eslint-disable prefer-destructuring, prettier/prettier */

export const APP_PORT = Number(process.env.APP_PORT ?? 3014);
export const BACKEND_PORT = Number(process.env.BACKEND_PORT ?? 5000);
export const GENERATE_SOURCEMAP = Boolean(Number(process.env.GENERATE_SOURCEMAP));
export const ANALYZE_BUNDLE = Boolean(Number(process.env.ANALYZE_BUNDLE));
export const SHOULD_CREATE_LEGACY_BUNDLE_FOR_DEVELOPMENT = Boolean(Number(process.env.SHOULD_CREATE_LEGACY_BUNDLE_FOR_DEVELOPMENT));
export const ASSETS_BASE_URL = process.env.ASSETS_BASE_URL;
export const ENCRYPTED_COOKIE_KEY = process.env.ENCRYPTED_COOKIE_KEY!;
export const SIGNED_COOKIE_KEY = process.env.SIGNED_COOKIE_KEY!;
export const LOCAL_ENV_FILE = process.env.LOCAL_ENV_FILE;
