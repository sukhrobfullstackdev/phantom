import { isEmpty } from '~/app/libs/lodash-utils';
import { JsonRpcError, JsonRpcRequestPayload } from 'magic-sdk';
import { semanticStringify } from '~/shared/libs/semantic-stringify';
import { sequentialPromise } from '~/shared/libs/sequential-promise';
import { store } from '~/app/store';
import { SystemThunks } from '~/app/store/system/system.thunks';
import { getLogger } from '~/app/libs/datadog';
import { DEFAULT_ERROR_CODE, DEFAULT_ERROR_MESSAGE } from '~/app/libs/exceptions/error-utils';
import { createServiceError } from '~/app/libs/exceptions/error-types/service-error';

/**
 * These errors are associated with specific JSON RPC requests and should be
 * resolved to the SDK.
 *
 * ~~~
 *
 * NOTE:
 *
 * This is labeled an `abstract` class to force compiler errors on attempted
 * instantiations. You should use the `createSDKError` factory to build
 * instances of `SDKError`.
 */
export abstract class SDKError extends Error {
  __proto__ = Error;
  public readonly jsonRpcError: JsonRpcError;
  public readonly code: string | number | null = null;
  private readonly detailedErrorMessage: string;
  private readonly data: any;

  constructor(jsonRpcError: Partial<JsonRpcError>) {
    super();
    // Defaults to standard JSON RPC internal error - see https://www.jsonrpc.org/specification#response_object
    this.jsonRpcError = {
      code: jsonRpcError.code ?? DEFAULT_ERROR_CODE,
      message: jsonRpcError.message ?? DEFAULT_ERROR_MESSAGE,
      data: jsonRpcError.data ?? undefined,
    };

    this.code = this.jsonRpcError.code;
    this.message = this.jsonRpcError.message;
    this.detailedErrorMessage = `[SDK Error]: [${String(this.code)}] ${String(this.message) ?? DEFAULT_ERROR_MESSAGE}`;
    this.data = jsonRpcError.data ?? undefined;

    Object.setPrototypeOf(this, SDKError.prototype);
  }

  /**
   * Sends a rejection for the given payload(s) to the SDK. This will also
   * report the error automatically.
   */
  public async sdkReject(
    payload?: JsonRpcRequestPayload | Partial<JsonRpcRequestPayload> | JsonRpcRequestPayload[] | null,
  ) {
    // to the SDK telling it to reject the promise
    try {
      if (!Array.isArray(payload) && payload?.id) {
        await store.dispatch(
          SystemThunks.resolveJsonRpcResponse({
            payload: payload as JsonRpcRequestPayload,
            error: {
              code: this.code ?? DEFAULT_ERROR_CODE,
              message: this.message ?? DEFAULT_ERROR_MESSAGE,
              data: this.data ?? undefined,
            } as JsonRpcError,
          }),
        );

        getLogger().warn(this.detailedErrorMessage, {
          json_rpc_method: payload.method,
          jsonRpcError: this.jsonRpcError,
          error_code: this.code,
        });
      } else if (Array.isArray(payload) && !isEmpty(payload)) {
        const rejections = payload.map(p => () => this.sdkReject(p));
        await sequentialPromise(rejections);
      } else {
        this.printErrorToConsole(payload as Partial<JsonRpcRequestPayload> | null);
        getLogger().warn(this.detailedErrorMessage, {
          json_rpc_method: 'No Method Present',
          jsonRpcError: this.jsonRpcError,
          error_code: this.code,
        });
      }
      // something went wrong in trying to fire the post message to reject the SDK promise, this will not catch many errors
    } catch (e) {
      createServiceError(e);
    }
  }

  /**
   * In the worst case scenario that we need to communicate an error to the
   * developer, but a payload cannot be associated to a request ID, we print a
   * descriptive error to the console.
   */
  private printErrorToConsole(payload?: Partial<JsonRpcRequestPayload> | null) {
    console.error(
      'An error failed to associate with a specific JSON RPC request.\n' +
        'This could be due to one of the following reasons:\n\n' +
        '1. The JSON RPC payload is incomplete, malformed, or nil.\n' +
        '2. The JSON RPC payload is missing the `id` parameter\n\n' +
        'The payload received is:\n\n' +
        `${semanticStringify(payload)}\n`,
    );
    console.error(new Error(this.detailedErrorMessage));
  }
}

/**
 * Create an instance of `SDKError`.
 */
export function createSDKError(code: string | number, message: string, details?: string, data?: any): SDKError {
  const messageWithDetails = details && details !== message ? `${message}: ${details}` : message;

  // We cast `SDKError` to `any` so we can circumvent the abstract class
  // rule. This is just a trick we use to communicate intent by raising
  // TypeScript compiler errors if `SDKError` is instantiated directly.
  return new (SDKError as any)({ code, message: messageWithDetails, data });
}
