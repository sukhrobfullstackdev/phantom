import {
  personalSign,
  recoverPersonalSignature,
  signTypedDataV1,
  signTypedDataV3,
  signTypedDataV4,
  signTransaction,
} from './signers';
import { createWallet, privateKeyToAccount } from './wallets';
import {
  getTransactionCount,
  getGasPrice,
  estimateGas,
  getNetworkId,
  sendRawTransaction,
  getChainId,
  getBlock,
  getBalance,
  ethCall,
  getCode,
} from './eth-methods';

export const Web3Service = {
  createWallet,
  privateKeyToAccount,
  signTypedDataV1,
  signTypedDataV3,
  signTypedDataV4,
  personalSign,
  recoverPersonalSignature,
  signTransaction,
  getTransactionCount,
  getGasPrice,
  estimateGas,
  getNetworkId,
  getChainId,
  sendRawTransaction,
  getBlock,
  getBalance,
  ethCall,
  getCode,
};
