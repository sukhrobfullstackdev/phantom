interface PollerOptions<T> {
  delay?: number;
  interval?: number;
  expiresIn?: number;
  onInterval?: (resolve: (value?: T) => void, reject: (reason?: any) => void) => Promise<void>;
  onExpire?: (resolve: (value?: T) => void, reject: (reason?: any) => void) => Promise<void>;
}

/* eslint-disable-next-line @typescript-eslint/no-empty-function */
const asyncNoop = async () => {};

/**
 * Creates a poller to execute some logic at regular intervals. The poller is
 * capable of being entirely async such that each "tap" will only proceed after
 * the previous "tap" has completed processing. You may optionally configure an
 * expiration time for the poller, after which the interval is automatically
 * cleaned up and an error can be raised, if desired.
 */
export function poller<T>(options: PollerOptions<T>) {
  const { delay = 0, interval = 2000, expiresIn = Infinity, onInterval = asyncNoop, onExpire = asyncNoop } = options;
  const startTime = Date.now();

  return new Promise<T>((resolve, reject) => {
    let timeout: any;
    let settled = false;

    const clearTimeoutSafely = () => {
      try {
        if (timeout) clearTimeout(timeout);
      } catch {}
    };

    const resolveAndCleanup = (...args: any[]) => {
      clearTimeoutSafely();
      if (!settled) {
        settled = true;
        (resolve as any)(...args);
      }
    };

    const rejectAndCleanup = (...args: any[]) => {
      clearTimeoutSafely();
      if (!settled) {
        settled = true;
        /* eslint-disable-next-line prefer-promise-reject-errors */
        reject(...args);
      }
    };

    const handleNextInterval = () => {
      if (!settled) {
        timeout = setTimeout(handle, interval);
      }
    };

    const handle = async () => {
      if (Date.now() - startTime >= expiresIn) {
        await onExpire(resolveAndCleanup, rejectAndCleanup).then(resolveAndCleanup).catch(rejectAndCleanup);
      } else {
        await onInterval(resolveAndCleanup, rejectAndCleanup).then(handleNextInterval).catch(rejectAndCleanup);
      }
    };

    // Start polling after the initial `delay`.
    setTimeout(() => {
      handle();
    }, delay);
  });
}
