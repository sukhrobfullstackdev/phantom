import { useSharedState } from '~/features/native-methods/hooks/use-shared-data';
import { useCallback } from 'react';
import { NftTokenType } from 'alchemy-sdk';

export type NFTTransferState = {
  contractAddress: string;
  tokenType: NftTokenType;
  tokenId: string;
  quantity: number;
  toAddress: string;
  txHash: string;
};

const defaultNFTTransferState: NFTTransferState = {
  contractAddress: '',
  tokenType: NftTokenType.ERC1155,
  tokenId: '',
  quantity: 1,
  toAddress: '',
  txHash: '',
};

export const useNFTTransferState = () => {
  const [nftTransferState, setNFTTransferState] = useSharedState<NFTTransferState>(['nft-transfer-state'], {
    ...defaultNFTTransferState,
  });

  const reset = useCallback((state?: Partial<NFTTransferState>) => {
    setNFTTransferState({
      ...defaultNFTTransferState,
      ...state,
    });
  }, []);

  return { nftTransferState, setNFTTransferState, reset };
};
