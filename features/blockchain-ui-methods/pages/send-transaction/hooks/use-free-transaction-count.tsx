import { useQuery } from '@tanstack/react-query';
import { useUserMetadata } from '~/features/native-methods/hooks/useUserMetadata';

// Note. Stability chain only
// The base url is not stable, it may change in the future
export const useFreeTransactionCount = () => {
  const { address } = useUserMetadata();

  const { data: freeTransactionCount, ...rest } = useQuery<number>({
    queryKey: ['stability', 'free-transaction-count', address],
    queryFn: async () => {
      const response = await fetch(
        `https://vzahfimc4y.us-east-2.awsapprunner.com/api/v1/free-transactions/${address}`,
      ).then(res => res.json());
      return response?.result?.remaining;
    },
  });
  return { freeTransactionCount, ...rest };
};
