import { useQuery } from '@tanstack/react-query';
import { NftTokenType } from 'alchemy-sdk';

import { getLogger } from '~/app/libs/datadog';
import { useAlchemy } from '~/features/blockchain-ui-methods/hooks/use-alchemy';

type Props = {
  contractAddress: string;
  tokenId: string;
  tokenType: NftTokenType;
};

export const useNFT = ({ contractAddress, tokenId, tokenType }: Props) => {
  const { alchemy } = useAlchemy();

  const { data: nft, ...rest } = useQuery({
    queryKey: ['nft', contractAddress, tokenId, tokenType],
    queryFn: () => {
      if (!alchemy) {
        getLogger().warn('Warning with useNFT: Alchemy is not initialized');
        return null;
      }

      if (!contractAddress || !tokenId) {
        getLogger().warn('Warning with useNFT: Missing contract address or token id');
        return null;
      }

      return alchemy.nft.getNftMetadata(contractAddress, tokenId, {
        tokenType,
      });
    },
    suspense: true,
    staleTime: 1000 * 60 * 5,
  });

  return { nft: nft!, ...rest };
};
