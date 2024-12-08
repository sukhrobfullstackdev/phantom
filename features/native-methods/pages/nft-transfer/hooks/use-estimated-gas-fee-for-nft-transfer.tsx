import { useQuery } from '@tanstack/react-query';
import { NftTokenType } from 'alchemy-sdk';

import { getLogger } from '~/app/libs/datadog';
import { useWalletForEVM } from '~/features/native-methods/hooks/use-wallet-for-evm';
import { useUserMetadata } from '~/features/native-methods/hooks/useUserMetadata';
import { createEVMNFTContract } from '~/features/native-methods/lib/alchemy/createEVMNFTContract';

type Props = {
  contractAddress: string;
  tokenId: string;
  tokenType: NftTokenType;
  toAddress: string;
  quantity: number;
};

export const useEstimatedGasFeeForNFTTransfer = ({
  contractAddress,
  tokenId,
  tokenType,
  toAddress,
  quantity,
}: Partial<Props>) => {
  const { wallet } = useWalletForEVM();
  const { address } = useUserMetadata();

  const { data: estimatedGasFee, ...rest } = useQuery({
    queryKey: ['estimated-gas-fee-for-nft-trasnfer', address, contractAddress, tokenId, tokenType, toAddress, quantity],
    queryFn: async () => {
      if (!wallet) {
        getLogger().warn('Warning with useEstimatedGasFeeForNFTTransfer: Wallet is not initialized');
        return null;
      }

      if (!contractAddress || !tokenId || !tokenType || !toAddress || !quantity) {
        getLogger().warn('Warning with useEstimatedGasFeeForNFTTransfer: Missing required fields');
        return null;
      }

      const nftContract = createEVMNFTContract({ contractAddress, tokenType, wallet });
      if (!nftContract) {
        throw new Error('Could not get NFT contract');
      }

      const gasPrice = await wallet.getGasPrice();
      const chainId = await wallet.getChainId();

      let multipled = gasPrice;
      // In case of Polygon, we need to multiply gas price by 1.5
      if (chainId === 80001 || chainId === 137) {
        multipled = multipled.mul(10).div(15);
      }

      if (tokenType === NftTokenType.ERC721) {
        const estimatedGas = await nftContract.estimateGas.transferFrom(address, toAddress, Number(tokenId));
        return estimatedGas.mul(multipled);
      }

      if (tokenType === NftTokenType.ERC1155) {
        const estimatedGas = await nftContract.estimateGas.safeTransferFrom(
          address,
          toAddress,
          Number(tokenId),
          quantity,
          '0x',
        );
        return estimatedGas.mul(multipled);
      }

      throw new Error('Invalid contract type');
    },
    suspense: true,
  });

  return { estimatedGasFee: estimatedGasFee!, ...rest };
};
