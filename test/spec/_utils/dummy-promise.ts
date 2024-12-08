import type { ThunkActionWrapper } from '~/app/store/types';

/**
 * Fulfill the type requirements of `ThunkActionWrapper<Promise<any>>`
 */
export const dummyPromise: ThunkActionWrapper<Promise<any>> = () => {
  return new Promise<void>((resolve, reject) => {
    resolve();
  });
};
