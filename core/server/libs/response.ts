import { AuthRelayerHttpError, isHttpError } from './exceptions';
import { MagicAPIResponse } from '~/shared/types/magic-api-response';

/**
 * Creates an object in following the `MagicAPIResponse` schema. You can send this as JSON to any data endpoints.
 *
 * @example
 * res.status(200).json(createResponseJson({ someData: 'omg' }));
 */
export function createResponseJson<TData = {}>(data?: TData): MagicAPIResponse<TData>;
export function createResponseJson(error?: AuthRelayerHttpError): MagicAPIResponse;
export function createResponseJson(dataOrError?: any): MagicAPIResponse {
  if (isHttpError(dataOrError)) {
    return {
      data: dataOrError?.data ?? {},
      error_code: dataOrError?.error_code,
      message: dataOrError?.message ?? 'Internal service error.',
      status: 'failed',
    };
  }

  return {
    data: dataOrError ?? {},
    error_code: '',
    message: '',
    status: 'ok',
  };
}
