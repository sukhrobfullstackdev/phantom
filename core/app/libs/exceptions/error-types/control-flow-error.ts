import { setUIThreadError } from '~/app/store/ui-thread/ui-thread.actions';
import { store } from '~/app/store';
import { resolveErrorMessage, isSDKError, DEFAULT_ERROR_MESSAGE } from '~/app/libs/exceptions/error-utils';
import { ControlFlowErrorCode } from '~/app/libs/exceptions/error-types/error-codes/control-flow-error-codes';
import { sdkErrorFactories } from '~/app/libs/exceptions/sdk-error-factories';
import { errorMapping } from '~/app/libs/exceptions/error-mapping';
import { getLogger } from '~/app/libs/datadog';
import { getLoggerType } from '~/app/libs/datadog-error-classification';
import { getTraceIdFromWindow } from '~/app/libs/trace-id';
/**
 * Represents internal application errors. These are strictly for control flow
 * and should not be exposed to the developer. If a developer error should be
 * created based on an `ControlFlowError` instance, then you can invoke
 * `ControlFlowError.getSDKError`.
 *
 * NOTE:
 *
 * This is labeled an `abstract` class to force compiler errors on attempted
 * instantiations. You should use the `createControlFlowError` factory to build
 * instances of `ControlFlowError`.
 */
export abstract class ControlFlowError extends Error {
  __proto__ = Error;
  trace_id?: string;
  config?: any;
  detailedErrorMessage: string;
  json_rpc_method?: string;

  constructor(
    public code: ControlFlowErrorCode = ControlFlowErrorCode.UnknownError,
    private nestedError?: any,
    json_rpc_method?: string,
  ) {
    super(`[ControlFlow Error]: [${ControlFlowErrorCode[code]}] Internal application error.`);
    Object.setPrototypeOf(this, ControlFlowError.prototype);

    // If the nested error is a `ServiceError`, we'll capture `trace_id` from that...
    this.trace_id = nestedError?.config?.trace_id;

    this.detailedErrorMessage = `[ControlFlow Error]: [${ControlFlowErrorCode[code]} ${
      nestedError?.code ?? `/ Nested Error Code: ${nestedError?.code}`
    }] Internal application error.`;

    const { loggerType, codeFoundInErrorMap } = getLoggerType(
      (nestedError?.code || this.code) as string | number | null,
    );

    const msg = this.detailedErrorMessage;
    const properties = {
      trace_id: nestedError?.config?.trace_id || getTraceIdFromWindow(),
      nestedError,
      json_rpc_method,
      code: ControlFlowErrorCode[this.code],
      controlFlowErrorType: ControlFlowErrorCode[this.code],
      codeFoundInErrorMap,
    };

    // report error on creation
    const logger = getLogger();
    if (loggerType === 'error') logger.error(msg, properties);
    if (loggerType === 'warn') logger.warn(msg, properties);
    if (loggerType === 'info') logger.info(msg, properties);
  }

  /**
   * Gets a `SDKError` derived from this instance of `ControlFlowError`. This is
   * helpful when communicating detailed error information to developers
   * building whitelabled experiences.
   */
  public getSDKError() {
    const fallthroughError = sdkErrorFactories.rpc.internalError(this.displayMessage);
    const mappingEntries = Object.entries(errorMapping());
    const item = mappingEntries.find(([code]) => Number(code) === this.code);

    if (item) {
      const factory = item[1].toSDKError;
      if (isSDKError(factory)) return factory;
      return factory ? factory(this, fallthroughError) : fallthroughError;
    }

    return fallthroughError;
  }

  public setUIThreadError() {
    store.dispatch(setUIThreadError(this));
  }

  /**
   * This dynamic property can be used to display a human readable message to
   * the user based on the nested `data`.
   */
  public get displayMessage() {
    const resolvedDisplayMessage = resolveErrorMessage(this.nestedError);

    const mappingEntries = Object.entries(errorMapping());
    const item = mappingEntries.find(([c]) => Number(c) === this.code);
    const fallbackDisplayMessage = item ? item[1].fallbackDisplayMessage : undefined;
    const overrideDisplayMessage = item ? item[1].overrideDisplayMessage : undefined;

    return resolvedDisplayMessage === DEFAULT_ERROR_MESSAGE
      ? overrideDisplayMessage ?? fallbackDisplayMessage ?? resolvedDisplayMessage
      : overrideDisplayMessage ?? resolvedDisplayMessage ?? fallbackDisplayMessage;
  }
}

/**
 * Create an instance of `ControlFlowError`.
 */
export function createControlFlowError(code: ControlFlowErrorCode, nestedError?: any): ControlFlowError {
  // We cast `ControlFlowError` to `any` so we can circumvent the abstract class
  // rule. This is just a trick we use to communicate intent by raising
  // TypeScript compiler errors if `ControlFlowError` is instantiated directly.

  const jsonRpcMethod = store.getState()?.ActivePayload?.activePayload?.method;

  return new (ControlFlowError as any)(code, nestedError, jsonRpcMethod);
}
