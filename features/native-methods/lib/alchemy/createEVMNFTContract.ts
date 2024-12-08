import { Contract, NftTokenType, Wallet } from 'alchemy-sdk';
import { getLogger } from '~/app/libs/datadog';

type Params = {
  contractAddress: string;
  tokenType: NftTokenType;
  wallet: Wallet;
};

export const createEVMNFTContract = ({ contractAddress, tokenType, wallet }: Params) => {
  const contractABI: string[] = [];
  if (tokenType === NftTokenType.ERC1155) {
    contractABI.push(
      'function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes calldata data) external',
      'function mintToken(uint256 _quantity, uint256 _tokenId) external payable',
      'function mint(uint256 _quantity, uint256 _tokenId) external payable',
    );
  } else if (tokenType === NftTokenType.ERC721) {
    contractABI.push(
      'function transferFrom(address from, address to, uint256 tokenId) public',
      'function mint(address to, uint256 tokenId) external payable',
      'function mint() external payable',
    );
  } else {
    getLogger().warn('Warning with createEVMNFTContract: Invalid contract type');
    throw new Error('Invalid contract type');
  }

  return new Contract(contractAddress, contractABI, wallet);
};
