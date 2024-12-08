import { store } from '~/app/store';

export const useIsLoggedInWithMagic = () => {
  const isLoggedInWithMagic = store.getState().Auth.userID;

  return { isLoggedInWithMagic: !!isLoggedInWithMagic };
};
