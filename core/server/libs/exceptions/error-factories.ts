import { createHttpError } from './error-utils';
import { AllowedHeaders } from '~/server/constants/allowed-headers';
import { OAuthHttpError } from './error-types';
import { AuthRelayerErrorCode } from './auth-relayer-server-error-codes';

function stringifyFieldsArray(source: string[]) {
  return `[${source.map(i => `'${i}'`).join(', ')}]`;
}

/**
 * HTTP error factories derived from `AuthRelayerErrorCode`.
 */
export const coreHttpErrors = {
  InternalServiceError: () =>
    createHttpError({
      status: 500,
      errorCode: AuthRelayerErrorCode.InternalServiceError,
      message: 'Internal service error.',
    }),

  MissingRequiredHeaders: (missingHeaders: AllowedHeaders[]) =>
    createHttpError({
      status: 400,
      errorCode: AuthRelayerErrorCode.MissingRequiredHeaders,
      message: `Missing required headers: ${stringifyFieldsArray(missingHeaders)}`,
    }),

  MissingRequiredFields: (missingFields: string[]) =>
    createHttpError({
      status: 400,
      errorCode: AuthRelayerErrorCode.MissingRequiredFields,
      message: `Missing required fields: ${stringifyFieldsArray(missingFields)}`,
    }),

  NotFound: () =>
    createHttpError({
      status: 404,
      errorCode: AuthRelayerErrorCode.NotFound,
      message:
        'The requested URL was not found on the server. If you entered the URL manually please check your spelling and try again.',
    }),

  UnableToRefreshSession: () =>
    createHttpError({
      status: 400,
      errorCode: AuthRelayerErrorCode.UnableToRefreshSession,
      message: 'Unable to refresh user session. Please log in using the magic link flow to enable session persistence.',
    }),

  OAuthStateMismatch: () =>
    createHttpError({
      status: 400,
      errorCode: AuthRelayerErrorCode.OAuthStateMismatch,
      message: 'State parameter mismatched between OAuth redirects.',
    }),

  OAuthCookieSignatureError: () =>
    createHttpError({
      status: 400,
      errorCode: AuthRelayerErrorCode.OAuthCookieSignatureError,
      message: 'Could not process OAuth request because cookies are malformed, missing, or tampered with.',
    }),

  InvalidRedirectUrl: redirectURL =>
    createHttpError({
      status: 400,
      errorCode: AuthRelayerErrorCode.InvalidRedirectUrl,
      message: `The given redirect URL ${redirectURL} is not in the allowlist.`,
    }),

  MissingRedirectAllowlist: redirectURL =>
    createHttpError({
      status: 400,
      errorCode: AuthRelayerErrorCode.InvalidRedirectUrl,
      message: `The redirect allowlist is empty, but is required for this application. Please add ${redirectURL} to your allowlist.`,
    }),
};

/**
 * Format HTTP errors with information forwarded from an OAuth provider.
 */
export function createOAuthHttpError(config: {
  status?: number;
  provider?: string;
  error: string;
  errorDescription?: string;
  errorURI?: string;
}): OAuthHttpError {
  const { status = 500, provider = 'unknown provider', error, errorURI, errorDescription = '' } = config;

  return createHttpError({
    status,
    errorCode: error,
    message: `OAuth Error (${provider}): [${error}] ${errorDescription}`,
    data: {
      oauth: {
        provider,
        error,
        error_description: errorDescription,
        error_uri: errorURI,
      },
    },
  });
}
