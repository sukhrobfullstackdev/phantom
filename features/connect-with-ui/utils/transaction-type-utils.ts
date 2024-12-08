import { getTokenSymbol } from './get-token-symbol';
import { Web3Service } from '~/app/services/web3';
import { getLogger } from '~/app/libs/datadog';
import { buildMessageContext } from '~/app/libs/analytics-datadog-helpers';
import { ethers } from 'ethers';

export type Web3UtilsUnit =
  | 'noether'
  | 'wei'
  | 'kwei'
  | 'Kwei'
  | 'babbage'
  | 'femtoether'
  | 'mwei'
  | 'Mwei'
  | 'lovelace'
  | 'picoether'
  | 'gwei'
  | 'Gwei'
  | 'shannon'
  | 'nanoether'
  | 'nano'
  | 'szabo'
  | 'microether'
  | 'micro'
  | 'finney'
  | 'milliether'
  | 'milli'
  | 'ether'
  | 'kether'
  | 'grand'
  | 'mether'
  | 'gether'
  | 'tether';

// These will correspond to custom UIs for each kind of transaction
export type TransactionType = undefined | 'eth-transfer' | 'token-transfer' | 'flow-usdc-transfer';

export const ETH_TRANSFER = 'eth-transfer';
export const TOKEN_TRANSFER = 'token-transfer';
export const FLOW_USDC_TRANSFER = 'flow-usdc-transfer';

export const getTransactionType = (txObject): TransactionType => {
  if (txObject.isSendFlowUsdc) return FLOW_USDC_TRANSFER;
  if (!txObject.data) return ETH_TRANSFER;
  const isTokenTransfer = isErc20TokenTransfer(txObject.data);
  return isTokenTransfer ? TOKEN_TRANSFER : ETH_TRANSFER;
};

const isErc20TokenTransfer = (data): boolean => {
  return data.substring(0, 10) === '0xa9059cbb';
};

export const getTokenDecimals = async (erc20TokenContractAddress: string): Promise<{ [x: string]: number }> => {
  const methodHash = '0x313ce567';
  try {
    const decimals = await Web3Service.ethCall(erc20TokenContractAddress, methodHash);
    return { [erc20TokenContractAddress]: Number(decimals) };
  } catch (e) {
    getLogger().error('Error fetching decimals', buildMessageContext(e));
    return { [erc20TokenContractAddress]: 18 };
  }
};

export const ethDecimalsToUnit = {
  18: 'ether',
  15: 'finney',
  12: 'micro',
  9: 'gwei',
  6: 'mwei',
  3: 'kwei',
  1: 'wei',
  0: '0',
};

// Only called when ERC20 token transfer is detected
export const getTokenTransferDetails = async txObject => {
  if (txObject.isSendFlowUsdc) {
    return {
      to: txObject.to,
      amount: txObject.value,
      symbol: 'USDC',
    };
  }
  const symbol = await getTokenSymbol(txObject.to);
  const to = `0x${txObject.data.substring(34, 74)}`;
  const amount = `0x${txObject.data.slice(-64)}`;
  const contractToDecimals = await getTokenDecimals(txObject.to as string);
  return {
    to,
    amount: Number(
      ethers.utils.formatUnits(
        amount,
        (ethDecimalsToUnit[contractToDecimals[txObject.to]] as Web3UtilsUnit) || 'ether',
      ),
    ).toString(),
    symbol: symbol[txObject.to],
  };
};

export const isTransactionValueZero = value => {
  if (!value || value === '0' || value === '0x' || value === '0x0' || value === '0.0') return true;
  return false;
};
