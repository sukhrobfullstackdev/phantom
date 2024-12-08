import { isNil, isNumber, isString } from '~/app/libs/lodash-utils';
import { JsonRpcResponsePayload } from 'magic-sdk';
import { SDKError } from './error-types/sdk-error';
import { ServiceError } from './error-types/service-error';
import { ControlFlowError } from './error-types/control-flow-error';
import { ControlFlowErrorCode, ContolFlowMappedErrorCode } from './error-types/error-codes/control-flow-error-codes';
import { MagicAPIResponse } from '~/shared/types/magic-api-response';

export const DEFAULT_ERROR_CODE = -32603;
export const DEFAULT_ERROR_MESSAGE = 'Internal error';

/**
 * Tries to resolve an error code from arbitrary `data`.
 *
 * - If `data` is a `ServiceError`, the underlying `ControlFlowErrorCode` is
 *   resolved. NOTE: the returned code is the same
 *   `ServiceError.getControlFlowError().code`
 *
 * - If `data` is a `ControlFlowError` or `SDKError`, the underlying `.code`
 *   property is resolved.
 *
 * - If `data` is _anything else_, an error code is searched for at the usual
 *   paths.
 *
 * Defaults to JSON RPC 2.0 standard error code `-32603` if the above cases
 * resolve `null` or `undefined`.
 */
export function resolveErrorCode(data?: ServiceError): ControlFlowErrorCode;
export function resolveErrorCode(data?: ControlFlowError): ControlFlowErrorCode;
export function resolveErrorCode(data?: SDKError): number;
export function resolveErrorCode(data?: MagicAPIResponse): string;
export function resolveErrorCode(data?: any): string | number;
export function resolveErrorCode(data?: any): string | number {
  return (
    (data as Partial<ServiceError>)?.getControlFlowError?.().code ??
    (data as Partial<ControlFlowError> | Partial<SDKError>)?.code ??
    (data as Partial<MagicAPIResponse>)?.error_code ??
    (isString(data?.error) || isNumber(data?.error) ? data?.error : null) ?? // OAuth errors
    (data as Partial<JsonRpcResponsePayload>)?.error?.code ??
    DEFAULT_ERROR_CODE
  );
}

/**
 * Tries to resolve an error message from arbitrary `data`.
 *
 * Defaults to JSON RPC 2.0 standard error message `"Internal error"` if `data`
 * resolves to `null`, `undefined`, or non-`string` values.
 */
export function resolveErrorMessage(data?: any) {
  if (typeof data === 'string') return data;
  const result = data?.error_message ?? data?.error_description ?? data?.error?.message ?? data?.message;
  return typeof result === 'string' ? result : DEFAULT_ERROR_MESSAGE;
}

/**
 * Type-guard asserting `value` is `SDKError`.
 */
export function isSDKError(value?: any): value is SDKError {
  return !isNil(value) && value instanceof SDKError;
}

/**
 * Type-guard asserting `value` is `ServiceError`.
 */
export function isServiceError(value?: any): value is ServiceError {
  return !isNil(value) && value instanceof ServiceError;
}

/**
 * Type-guard asserting `value` is `ControlFlowError`.
 */
export function isControlFlowError(value?: any): value is ControlFlowError {
  return !isNil(value) && value instanceof ControlFlowError;
}

/**
 * Type-guard asserting `value` is `Error`.
 */
export function isError(value?: any): value is Error {
  return !isNil(value) && value instanceof Error;
}

/**
 * Type-guard asserting `value` is `Error` only if the wallet type is "ICON".
 */
export function isIconError(value?: any): value is Error {
  return value.walletType === 'ICON' && value instanceof Error;
}

export type ErrorMappingSDKErrorFactory =
  | ((sourceError: ControlFlowError, fallthroughError: SDKError) => SDKError)
  | SDKError;

export type ErrorMappingConfig = {
  fromServiceError: ContolFlowMappedErrorCode | ContolFlowMappedErrorCode[] | null;
  toSDKError: ErrorMappingSDKErrorFactory | null;
  fallbackDisplayMessage?: string;
  overrideDisplayMessage?: string;
};

/**
 * The `ErrorMapping` is a dictionary of configurations containing all the
 * information required to construct error flows.
 *
 * We define this as a function to avoid circular dependencies between files
 * within this directory.
 */
export type ErrorMapping = () => {
  [P in ControlFlowErrorCode]: ErrorMappingConfig;
};
