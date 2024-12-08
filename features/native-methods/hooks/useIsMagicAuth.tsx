import { store } from '~/app/store';

export const useIsMagicAuth = () => {
  const { activeAuthWallet } = store.hooks.useSelector(state => state.User);
  return { isMagicAuth: !!activeAuthWallet };
};
