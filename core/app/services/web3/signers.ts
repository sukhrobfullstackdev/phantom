/* eslint-disable no-param-reassign, no-useless-catch */

import sigUtil, { EIP712TypedData, EIP712LegacyData } from 'eth-sig-util';
import { TransactionConfig } from 'web3-core';
import { privateKeyToAccount } from './wallets';

const EMPTY_SIGNATURE = '0x0';

export function signTypedDataV1(typedData: EIP712LegacyData, privateKey?: string) {
  if (privateKey) {
    const buffer = Buffer.from(privateKey.substring(2), 'hex');
    const signature = sigUtil.signTypedDataLegacy(buffer, { data: typedData });

    // Mark the private key variable for garbage collection.
    (privateKey as any) = null;

    return signature;
  }
  return EMPTY_SIGNATURE;
}

export function signTypedDataV3(typedData: EIP712TypedData, privateKey?: string) {
  if (privateKey) {
    const buffer = Buffer.from(privateKey.substring(2), 'hex');
    const signature = sigUtil.signTypedData(buffer, { data: typedData });

    // Mark the private key variable for garbage collection.
    (privateKey as any) = null;

    return signature;
  }
  return EMPTY_SIGNATURE;
}

export function signTypedDataV4(typedData: EIP712TypedData, privateKey?: string) {
  if (privateKey) {
    const buffer = Buffer.from(privateKey.substring(2), 'hex');
    const signature = (sigUtil as any).signTypedData_v4(buffer, { data: typedData });

    // Mark the private key variable for garbage collection.
    (privateKey as any) = null;

    return signature;
  }
  return EMPTY_SIGNATURE;
}

export function personalSign(message: string, privateKey?: string) {
  if (privateKey) {
    const buffer = Buffer.from(privateKey.substring(2), 'hex');
    const signature = sigUtil.personalSign(buffer, { data: message });

    // Mark the private key variable for garbage collection.
    (privateKey as any) = null;

    return signature;
  }
  return EMPTY_SIGNATURE;
}

export function recoverPersonalSignature(message: string, signature: string) {
  return sigUtil.recoverPersonalSignature({
    data: message,
    sig: signature,
  });
}

export async function signTransaction(tx: TransactionConfig, privateKey?: string) {
  if (privateKey) {
    try {
      const account = privateKeyToAccount(privateKey);
      return account.signTransaction(tx);
    } catch (e) {
      throw e;
    } finally {
      // Mark the private key variable for garbage collection.
      (privateKey as any) = null;
    }
  }
  throw new Error('Cannot sign a transaction without a valid private key.');
}
