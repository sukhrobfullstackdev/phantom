import BN from 'bn.js';
import { ethers } from 'ethers';

type bnType = string | number;

export const getFiatValue = (wei: string, price: string): number => {
  const priceBN = new BN(Number(price) * 100); // convert to cents since BN ignores decimals
  const weiBN = new BN(wei);
  const valueBN = weiBN.mul(priceBN);
  const valueInCents = Number(ethers.utils.formatUnits(valueBN.toString())).toString();
  const valueInUsd = Number(valueInCents) / 100; // Convert back to dollars
  return valueInUsd;
};

export const fromWeiToEth = (wei: string): string => {
  return Number(ethers.utils.formatUnits(wei, 'ether')).toString();
};

export const add = (numOne: bnType, numTwo: bnType): string => {
  return new BN(numOne).add(new BN(numTwo)).toString();
};

export const subtract = (numOne: bnType, numTwo: bnType): string => {
  return new BN(numOne).sub(new BN(numTwo)).toString();
};

export const multiply = (numOne: bnType, numTwo: bnType): string => {
  return new BN(numOne).mul(new BN(numTwo)).toString();
};

export const divide = (numOne: bnType, numTwo: bnType): string => {
  return new BN(numOne).div(new BN(numTwo)).toString();
};

export const isGreaterThan = (numOne: bnType, numTwo: bnType): boolean => {
  return new BN(numOne).gt(new BN(numTwo));
};

export const isGreaterThanOrEqualTo = (numOne: bnType, numTwo: bnType): boolean => {
  return new BN(numOne).gte(new BN(numTwo));
};
