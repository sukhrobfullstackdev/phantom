import { Nft } from 'alchemy-sdk';
import { useSharedState } from '~/features/native-methods/hooks/use-shared-data';

export type NFTTransferParams = {
  ak: string;
  tct: string;
  from: string;
  to: string;
  estimatedGasFee: string;
  nft: Nft & {
    quantity: number;
  };
  email: string;
  appName: string;
};

export const useNFTTransferParams = () => {
  const [nftTransferParams] = useSharedState<NFTTransferParams>(['nft-transfer-params']);
  return { nftTransferParams };
};
