import { store } from '~/app/store';

export const useUserMetadata = () => {
  const address = store.hooks.useSelector(state => state.Auth.userKeys.publicAddress);
  const email = store.hooks.useSelector(state => state.Auth.userEmail);
  const userId = store.hooks.useSelector(state => state.Auth.userID);

  if (!address) {
    throw new Error('Something went wrong. User address is not defined.');
  }

  return { address, email, userId };
};
