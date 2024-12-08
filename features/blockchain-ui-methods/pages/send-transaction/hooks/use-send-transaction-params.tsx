import { store } from '~/app/store';

export const useSendTransactionParams = () => {
  const sendTransactionRouteParams = store.hooks.useSelector(state => state.User.sendTransactionRouteParams);
  return { sendTransactionParams: sendTransactionRouteParams! };
};
