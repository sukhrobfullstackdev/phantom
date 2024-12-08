import { useQuery } from '@tanstack/react-query';
import { useAlchemy } from '~/features/blockchain-ui-methods/hooks/use-alchemy';

type Props = {
  address: string;
};

export const useBalanceForEVM = ({ address }: Props) => {
  const { alchemy } = useAlchemy();

  const { data: balance, ...rest } = useQuery({
    queryKey: ['balance-for-evm', address],
    queryFn: () => {
      return alchemy.core.getBalance(address);
    },
    suspense: true,
  });

  return { balance: balance!, ...rest };
};
