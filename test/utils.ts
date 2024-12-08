/**
 * Will flush jest timers and the promose queue to
 * make testing async timers easier.
 */
export const tickAsyncJestTimer = async (ticks: number) => {
  let tick = 0;
  while (tick < ticks && ticks > 0) {
    jest.runOnlyPendingTimers();
    // eslint-disable-next-line no-await-in-loop
    await Promise.resolve();
    tick++;
  }
};
