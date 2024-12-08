import { useSharedState } from '~/features/native-methods/hooks/use-shared-data';

type CollectiableDetailsState = {
  contractAddress: string;
  tokenId: string;
};

export const useCollectiableDetailsState = () => {
  const [collectiableDetailsState, setCollectiableDetailsState] = useSharedState<CollectiableDetailsState>(
    ['collectiable-details-state'],
    {
      contractAddress: '',
      tokenId: '',
    },
  );

  return { collectiableDetailsState, setCollectiableDetailsState };
};
