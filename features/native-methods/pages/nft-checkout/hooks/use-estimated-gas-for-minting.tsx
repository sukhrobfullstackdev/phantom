import { useQuery } from '@tanstack/react-query';
import { BigNumber } from 'ethers';

import { getLogger } from '~/app/libs/datadog';
import { NftTokenType } from 'alchemy-sdk';
import { createEVMNFTContract } from '~/features/native-methods/lib/alchemy/createEVMNFTContract';
import { parseEther } from 'ethers/lib/utils';
import { useWalletForEVM } from '~/features/native-methods/hooks/use-wallet-for-evm';
import { NFTError, NFT_ERROR_TYPES } from '~/features/native-methods/hooks/use-nft-error';

type Props = {
  contractAddress: string;
  tokenType: NftTokenType;
  tokenId: string;
  quantity: number;
  value?: string;
};

export const useEstimatedGasFeeForMinting = ({ contractAddress, tokenType, tokenId, quantity, value }: Props) => {
  const { wallet } = useWalletForEVM();

  const { data: estimatedGasFee, ...rest } = useQuery<BigNumber>({
    queryKey: ['estimated-minting-gas-fee', wallet, contractAddress, tokenType, tokenId, quantity],
    queryFn: async () => {
      if (!wallet) {
        getLogger().warn('Warning with useEstimatedGasFeeForMinting: Wallet is not initialized');
        throw new Error('Wallet is not initialized');
      }

      const nftContract = createEVMNFTContract({ contractAddress, tokenType, wallet });

      const feeData = await wallet.getFeeData();

      if (tokenType === NftTokenType.ERC1155) {
        const estimatedGas = await nftContract.estimateGas.mintToken(quantity, Number(tokenId), {
          maxFeePerGas: feeData.maxFeePerGas,
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
          value: value ? parseEther(value) : '0',
        });

        return estimatedGas.mul(feeData.gasPrice ?? '0');
      }

      if (tokenType === NftTokenType.ERC721) {
        const estimatedGas = await nftContract.estimateGas.mint({
          maxFeePerGas: feeData.maxFeePerGas,
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
          gasLimit: 1000000,
          value: value ? parseEther(value) : '0',
        });
        return estimatedGas.mul(feeData.gasPrice ?? '0');
      }

      throw new NFTError(NFT_ERROR_TYPES.NOT_SUPPORTED_TOKEN_STANDARD);
    },
    retry: false,
    suspense: true,
  });

  return { estimatedGasFee: estimatedGasFee!, ...rest };
};
