/**
 * A `Promise` that resolves after `ms` milliseconds.
 */
export function wait(ms: number) {
  return new Promise<void>(resolve => {
    setTimeout(resolve, ms);
  });
}
