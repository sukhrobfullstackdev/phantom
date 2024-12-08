import { useQuery } from '@tanstack/react-query';
import { NftOrdering, OwnedNft } from 'alchemy-sdk';

import { useUserMetadata } from './useUserMetadata';
import { useAlchemy } from '~/features/blockchain-ui-methods/hooks/use-alchemy';

export const useOwnedNFTs = () => {
  const { alchemy } = useAlchemy();
  const { address } = useUserMetadata();

  const { data: ownedNFTs, ...rest } = useQuery<OwnedNft[]>({
    queryKey: ['owned-nfts', alchemy.config.network, address],
    queryFn: async () => {
      const response = await alchemy.nft.getNftsForOwner(address, {
        orderBy: NftOrdering.TRANSFERTIME,
      });

      return response.ownedNfts;
    },
    suspense: true,
  });

  return { ownedNFTs: ownedNFTs!, ...rest };
};
