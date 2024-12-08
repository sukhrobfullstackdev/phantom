import { AxiosError } from 'axios';
import crypto from 'crypto';
import createError, { HttpError } from 'http-errors';
import { ENCRYPTED_COOKIE_KEY } from '~/server/constants/env';
import { ensureArray } from '~/shared/libs/array-helpers';
import { isAxiosError } from '~/shared/libs/axios/client-side-axios';
import { pickBy } from '~/shared/libs/object-helpers';
import { AuthRelayerErrorCode } from './auth-relayer-server-error-codes';
import { AuthRelayerHttpError, OAuthHttpError } from './error-types';

type CreateHttpErrorFromSourceError<TData extends {} = {}> = {
  sourceErrors: Error | Error[];
  data?: TData;
};

type CreateHttpErrorFromScratch<TErrorCode extends string = AuthRelayerErrorCode, TData extends {} = {}> = {
  status: number;
  message: string;
  errorCode: TErrorCode;
  data?: TData;
};

function isFromSourceError<TData extends {} = {}>(t: any): t is CreateHttpErrorFromSourceError<TData> {
  return !!t.sourceErrors;
}

/**
 * A low-level factory for creating `AuthRelayerHttpError` objects.
 */
export function createHttpError<TData extends {} = {}>(
  options: CreateHttpErrorFromSourceError<TData>,
): AuthRelayerHttpError<TData>;

export function createHttpError<TErrorCode extends string = AuthRelayerErrorCode, TData extends {} = {}>(
  options: CreateHttpErrorFromScratch<TErrorCode, TData>,
): AuthRelayerHttpError<TData>;

export function createHttpError<TErrorCode extends string = AuthRelayerErrorCode, TData extends {} = {}>(
  options: CreateHttpErrorFromSourceError<TData> | CreateHttpErrorFromScratch<TErrorCode, TData>,
) {
  const sourceErrors = isFromSourceError(options) ? ensureArray(options.sourceErrors) : [];
  const status = isFromSourceError(options) ? getErrorStatus(sourceErrors[0]) : options.status;
  const message = isFromSourceError(options) ? 'Internal service error.' : options.message;
  const errorCode = isFromSourceError(options) ? AuthRelayerErrorCode.InternalServiceError : options.errorCode;
  const data = options.data ?? ({} as TData);

  return createError(status, message, {
    error_code: errorCode,
    nested_errors: sourceErrors,
    data,
  }) as AuthRelayerHttpError<TData>;
}

/**
 * Type-guard that determines if the given argument is a valid
 * `AuthRelayerHttpError`.
 */
export function isHttpError(err: any): err is AuthRelayerHttpError {
  return err instanceof HttpError && !!err?.error_code && !!err?.nested_errors;
}

/**
 * Type-guard that determines if the given argument is a valid
 * `AuthRelayerHttpError`.
 */
export function isOAuthError(err: any): err is OAuthHttpError {
  return isHttpError(err) && !!err?.data?.oauth;
}

/**
 * From the given `err`, retrieve the associated HTTP status code.
 */
export function getErrorStatus(err?: AuthRelayerHttpError | AxiosError | Error) {
  if (isHttpError(err)) {
    return err.status;
  }

  if (isAxiosError(err)) {
    return err.response?.status ?? 500;
  }

  return 500;
}

/**
 * Asserts whether the given `err` has a status code provided in `statuses`.
 */
export function assertErrorStatus(err: AuthRelayerHttpError | AxiosError, statuses: number | number[]) {
  return !!ensureArray(statuses).find(status => {
    return getErrorStatus(err) === status;
  });
}

/**
 * Asserts whether the given `err` has the error code provided in
 * `codes`.
 */
export function assertErrorCode(err: AuthRelayerHttpError, codes: string | string[]) {
  return !!ensureArray(codes).find(code => err.error_code === code);
}

/**
 * Extract the serializable data from the given `error`.
 */
export function getSerializableErrorData(error: Error | AuthRelayerHttpError | AxiosError) {
  if (isAxiosError(error)) {
    return pickBy({
      exception_type: 'AxiosError',
      error_code: 'auth_relayer/AXIOS_ERROR',
      axios_exception_json: error.toJSON(),
    });
  }

  if (isHttpError(error)) {
    return pickBy({
      exception_type: error.name,
      exception_message: error.message,
      exception_stack: error.stack,
      exception_data: error.data,
      error_code: error.error_code,
      nested_errors: error.nested_errors.map(getSerializableErrorData),
    });
  }

  return pickBy({
    exception_type: error.name,
    exception_message: error.message,
    exception_stack: error.stack,
  });
}

/**
 * For client-side errors, we pass a SHA256 signature created from the
 * `error_code` and `message` into the URL query. The error route
 * validates the signature before rendering the client-side app.
 *
 * This was implemented to resolve an H1 security report identifying a "content
 * spoofing" vulnerability in Auth Relayer.
 *
 * @see https://app.shortcut.com/magic-labs/story/48107/error-page-content-spoofing-or-text-injection
 */
export function createErrorSignature(data: {
  // OAuth error fields
  error?: string;
  error_description?: string;
  error_uri?: string;

  // Magic error fields
  error_code?: string;
  message?: string;
}) {
  const { error, error_description, error_uri, error_code, message } = data;

  return crypto
    .createHmac('sha256', ENCRYPTED_COOKIE_KEY)
    .update([error ?? error_code, error_description ?? message, error_uri].filter(Boolean).join(':'))
    .digest('hex');
}

export function validateErrorSignature(
  signature?: string,
  data?: {
    // OAuth error fields
    error?: string;
    error_description?: string;
    error_uri?: string;

    // Magic error fields
    error_code?: string;
    message?: string;
  },
) {
  if (!signature || !data) return false;
  return createErrorSignature(data) === signature;
}
