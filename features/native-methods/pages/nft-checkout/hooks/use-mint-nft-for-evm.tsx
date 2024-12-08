import { useMutation } from '@tanstack/react-query';
import { NftTokenType } from 'alchemy-sdk';
import { AnalyticsActionType, trackAction } from '~/app/libs/analytics';
import { getLogger } from '~/app/libs/datadog';
import { buildMessageContext } from '~/app/libs/analytics-datadog-helpers';

import { isProd } from '~/features/native-methods/utils/is-prod';
import { createEVMNFTContract } from '~/features/native-methods/lib/alchemy/createEVMNFTContract';
import { parseEther } from 'ethers/lib/utils';
import { useWalletForEVM } from '~/features/native-methods/hooks/use-wallet-for-evm';

type Params = {
  toAddress: string;
  contractAddress: string;
  tokenType: NftTokenType;
  tokenId: string;
  quantity: number;
  value?: string;
};

type Response = {
  txHash: string;
};

export const useMintNFTForEVM = () => {
  const { wallet } = useWalletForEVM();

  const { mutateAsync: mintNFTForEVM, ...rest } = useMutation<Response, Error, Params>({
    mutationFn: async ({ contractAddress, tokenId, tokenType, quantity, toAddress, value }: Params) => {
      if (!wallet) {
        throw new Error('Cannot transfer NFT without wallet');
      }

      const nftContract = createEVMNFTContract({ contractAddress, tokenType, wallet });

      if (tokenType === NftTokenType.ERC1155) {
        const response = await nftContract.mintToken(quantity, Number(tokenId), {
          value: value ? parseEther(value) : 0,
        });
        return { txHash: response.hash };
      }

      if (tokenType === NftTokenType.ERC721) {
        const response = nftContract.mint({
          gasLimit: 1000000,
          value: value ? parseEther(value) : 0,
        });
        return { txHash: response.hash };
      }

      throw new Error('Invalid contract type');
    },
    onError: error => {
      if (isProd) {
        getLogger().error('Failed to mint nft', buildMessageContext(error));
        trackAction(AnalyticsActionType.NFTCheckoutFailed, { error });
      }
    },
    onSuccess: (_, params) => {
      if (isProd) {
        getLogger().info('Successfully minting nft', params);
        trackAction(AnalyticsActionType.NFTCheckoutSuccess, params);
      }
    },
  });

  return { mintNFTForEVM, ...rest };
};
