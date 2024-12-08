import { useMutation } from '@tanstack/react-query';
import { NftTokenType } from 'alchemy-sdk';
import { AnalyticsActionType, trackAction } from '~/app/libs/analytics';
import { getLogger } from '~/app/libs/datadog';
import { buildMessageContext } from '~/app/libs/analytics-datadog-helpers';

import { useUserMetadata } from '~/features/native-methods/hooks/useUserMetadata';
import { isProd } from '~/features/native-methods/utils/is-prod';
import { useWalletForEVM } from '~/features/native-methods/hooks/use-wallet-for-evm';
import { createEVMNFTContract } from '~/features/native-methods/lib/alchemy/createEVMNFTContract';

type Params = {
  contractAddress: string;
  tokenType: NftTokenType;
  tokenId: string;
  toAddress: string;
  quantity: number;
};

type Response = {
  hash: string;
};

export const useTransferNFTForEVM = () => {
  const { wallet } = useWalletForEVM();
  const { address } = useUserMetadata();

  const { mutateAsync: transferNFTForEVM, ...rest } = useMutation<Response, Error, Params>({
    mutationFn: async ({ contractAddress, tokenType, tokenId, quantity, toAddress }: Params) => {
      if (!wallet) {
        throw new Error('Cannot transfer NFT without wallet');
      }

      const nftContract = createEVMNFTContract({ contractAddress, tokenType, wallet });
      if (!nftContract) {
        throw new Error('Could not get NFT contract');
      }

      const gasPrice = await wallet.getGasPrice();
      const chainId = await wallet.getChainId();

      let multipled = gasPrice.toNumber();
      // In case of Polygon, we need to multiply gas price by 1.5
      if (chainId === 80001 || chainId === 137) {
        multipled = Math.ceil(multipled * 1.5);
      }

      if (tokenType === NftTokenType.ERC721) {
        return nftContract.transferFrom(address, toAddress, Number(tokenId), {
          gasPrice: multipled,
        });
      }

      if (tokenType === NftTokenType.ERC1155) {
        return nftContract.safeTransferFrom(address, toAddress, Number(tokenId), quantity, '0x', {
          gasPrice: multipled,
        });
      }

      throw new Error('Invalid contract type');
    },
    onError: error => {
      if (isProd) {
        getLogger().error('Failed to transfer NFT', buildMessageContext(error));
        trackAction(AnalyticsActionType.NFTTransferFailed, { error });
      }
    },
    onSuccess: (_, params) => {
      if (isProd) {
        getLogger().info('Successfully transferred NFT', params);
        trackAction(AnalyticsActionType.NFTTransferred, params);
      }
    },
  });

  return { transferNFTForEVM, ...rest };
};
