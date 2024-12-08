import { ethers } from 'ethers';
import { Web3Service } from '~/app/services/web3';

export const getTokenSymbol = async (erc20TokenContractAddress): Promise<any> => {
  // generated from `web3.utils.sha3('symbol()').substring(0, 10)`
  const methodHash = '0x95d89b41';
  const hexSymbol = await Web3Service.ethCall(erc20TokenContractAddress, methodHash);
  return {
    [erc20TokenContractAddress]: ethers.utils
      .toUtf8String(ethers.utils.arrayify(hexSymbol))
      .replace(/[^\x20-\x7E]/g, '')
      .trim(),
  };
};
