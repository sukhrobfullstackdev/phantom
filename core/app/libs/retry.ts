export const retry = async (fn, maxAttempts, delayInSeconds) => {
  const execute = async attempt => {
    try {
      return await fn();
    } catch (e) {
      if (attempt <= maxAttempts) {
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        const nextAttempt = attempt + 1;
        return delay(() => execute(nextAttempt), delayInSeconds * 1000);
      }
      throw e;
    }
  };
  return execute(1);
};

const delay = (fn, ms) => new Promise(resolve => setTimeout(() => resolve(fn()), ms));
