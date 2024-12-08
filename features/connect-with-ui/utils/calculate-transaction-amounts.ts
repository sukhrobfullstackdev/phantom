import { calculateNetworkFee } from '~/app/libs/web3-utils';
import { add, getFiatValue } from './bn-math';
import { ethers } from 'ethers';

export interface TransactionAmountsInterface {
  transactionValueInWei: string;
  transactionValueInFiat: number;
  networkFeeInWei: string;
  networkFeeInFiat: number;
  totalInWei: string;
  totalInFiat: number;
}

export const calculateTransactionAmounts = async (
  value,
  ethPrice,
  payload,
  isConstructTxFlow = false,
): Promise<TransactionAmountsInterface> => {
  const transactionValueInWei = ethers.BigNumber.from(value || '0x0').toString();
  const transactionValueInFiat = getFiatValue(transactionValueInWei, ethPrice || '0');
  const networkFeeInWei = await calculateNetworkFee(payload, isConstructTxFlow);
  const networkFeeInFiat = getFiatValue(networkFeeInWei, ethPrice || '0');
  const totalInWei = add(networkFeeInWei, transactionValueInWei);
  const totalInFiat = getFiatValue(totalInWei, ethPrice || '0');

  return {
    transactionValueInWei,
    transactionValueInFiat,
    networkFeeInWei,
    networkFeeInFiat,
    totalInWei,
    totalInFiat,
  };
};
