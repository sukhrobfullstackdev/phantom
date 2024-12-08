import { ControlFlowError, createControlFlowError } from '~/app/libs/exceptions/error-types/control-flow-error';
import { resolveErrorCode, resolveErrorMessage } from '~/app/libs/exceptions/error-utils';
import { ControlFlowErrorCode } from '~/app/libs/exceptions/error-types/error-codes/control-flow-error-codes';
import { errorMapping } from '~/app/libs/exceptions/error-mapping';
import { getLogger } from '~/app/libs/datadog';
import { store } from '~/app/store';
import { getLoggerType } from '~/app/libs/datadog-error-classification';
import { getTraceIdFromWindow } from '~/app/libs/trace-id';

export interface ServiceErrorAdditionalParams {
  noReport?: boolean;
}

export interface ServiceErrorMetadata {
  trace_id?: boolean;
  [key: string]: any;
}

/**
 * These errors automatically emit to datadog. They _may_ contain relevant
 * information that we should pass to the developer, but it depends on context.
 * This type of error is usually raised when interactions with third party
 * services fail for some reason (which is why this type of error is more
 * loosely-typed).
 *
 * ~~~
 *
 * NOTE:
 *
 * This is labeled an `abstract` class to force compiler errors on attempted
 * instantiations. You should use the `createServiceError` factory to build
 * instances of `ServiceError`.
 */
export abstract class ServiceError extends Error {
  __proto__ = Error;

  constructor(
    public readonly message: any,
    public readonly code: string | null = null,
    public readonly config: ServiceErrorAdditionalParams & ServiceErrorMetadata = {},
    public readonly detailedErrorMessage: string,
    public readonly json_rpc_method?: string,
  ) {
    super();

    this.detailedErrorMessage = code
      ? `[Service Error]: [${code}] ${JSON.stringify(message)}`
      : JSON.stringify(message);

    if (!config.noReport) {
      const { error_code, trace_id, ...otherMetadata } = this.config;

      const { loggerType, codeFoundInErrorMap } = getLoggerType(this.code);

      const msg = this.detailedErrorMessage;
      const properties = {
        ...otherMetadata,
        code: this.code,
        error_code,
        trace_id: trace_id || getTraceIdFromWindow(),
        json_rpc_method,
        codeFoundInErrorMap,
      };

      // report error on creation
      const logger = getLogger();
      if (loggerType === 'error') logger.error(msg, properties);
      if (loggerType === 'warn') logger.warn(msg, properties);
      if (loggerType === 'info') logger.info(msg, properties);
    }

    Object.setPrototypeOf(this, ServiceError.prototype);
  }

  /**
   * Gets an `ControlFlowError` derived from this instance of `SDKError`. This is
   * useful to centralize control flow errors based on external API services.
   *
   * Unlike `ControlFlowError`, which has a mapping for each type of error to an
   * instance of `SDKError`, this mapping is less strict. We just do our
   * best to associate as many common or expected errors as we can. Most errors
   * will fallthrough as "generic" server errors.
   */
  public getControlFlowError(): ControlFlowError {
    const fallthroughError = createControlFlowError(ControlFlowErrorCode.GenericServerError, this);
    const mappingEntries = Object.entries(errorMapping());
    const item = mappingEntries.find(([code, config]) =>
      Array.isArray(config.fromServiceError)
        ? config.fromServiceError.includes(this.code!)
        : config.fromServiceError === this.code,
    );
    return item && this.code ? createControlFlowError(Number(item[0]), this) : fallthroughError;
  }
}

/**
 * Create an instance of `ServiceError`.
 */
export function createServiceError(
  sourceError: unknown,
  config?: ServiceErrorAdditionalParams & ServiceErrorMetadata,
): ServiceError {
  // We cast `SDKError` to `any` so we can circumvent the abstract class
  // rule. This is just a trick we use to communicate intent by raising
  // TypeScript compiler errors if `SDKError` is instantiated directly.

  const jsonRpcMethod = store.getState()?.ActivePayload?.activePayload?.method;

  return new (ServiceError as any)(
    resolveErrorMessage(sourceError),
    resolveErrorCode(sourceError),
    config,
    jsonRpcMethod,
  );
}
