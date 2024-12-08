import { EIP712LegacyData, EIP712TypedData } from 'eth-sig-util';
import { SignedTransaction, TransactionConfig } from 'web3-core';
import { Web3Service } from '~/app/services/web3';
import { ThunkActionWrapper } from '~/app/store/types';
import { TestMode } from '../store/test-mode.reducer';

function signTypedDataV1ForUser(typedData: EIP712LegacyData): ThunkActionWrapper<Promise<string>, typeof TestMode> {
  return async (dispatch, getState) => {
    const { privateAddress } = getState();
    const signature = Web3Service.signTypedDataV1(typedData, privateAddress);
    return signature;
  };
}

function signTypedDataV3ForUser(typedData: EIP712TypedData): ThunkActionWrapper<Promise<string>, typeof TestMode> {
  return async (dispatch, getState) => {
    const { privateAddress } = getState();
    const signature = Web3Service.signTypedDataV3(typedData, privateAddress);
    return signature;
  };
}

function signTypedDataV4ForUser(typedData: EIP712TypedData): ThunkActionWrapper<Promise<string>, typeof TestMode> {
  return async (dispatch, getState) => {
    const { privateAddress } = getState();
    const signature = Web3Service.signTypedDataV4(typedData, privateAddress);
    return signature;
  };
}

function personalSignForUser(message: string): ThunkActionWrapper<Promise<string>, typeof TestMode> {
  return async (dispatch, getState) => {
    const { privateAddress } = getState();
    const signature = Web3Service.personalSign(message, privateAddress);
    return signature;
  };
}

function signTransactionForUser(
  tx: TransactionConfig,
): ThunkActionWrapper<Promise<SignedTransaction>, typeof TestMode> {
  return async (dispatch, getState) => {
    const { privateAddress } = getState();
    return Web3Service.signTransaction(tx, privateAddress);
  };
}

export const TestModeWeb3Signers = {
  personalSignForUser,
  signTypedDataV4ForUser,
  signTypedDataV3ForUser,
  signTypedDataV1ForUser,
  signTransactionForUser,
};
