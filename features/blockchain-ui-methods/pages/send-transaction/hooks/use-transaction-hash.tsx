import { useSharedState } from '~/features/native-methods/hooks/use-shared-data';

export const useTransactionHash = () => {
  const [transactionHash, setTransactionHash] = useSharedState<string>(['transaction-hash'], '');
  return { transactionHash, setTransactionHash };
};
