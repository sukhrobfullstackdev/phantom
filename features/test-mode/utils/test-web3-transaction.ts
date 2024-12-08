import type { JsonRpcRequestPayload } from 'magic-sdk';
import type { TransactionConfig } from 'web3-core';
import { Web3Service } from '~/app/services/web3';
import { testModeStore } from '../store';
import { TestModeWeb3Signers } from './test-web3-signers';

export async function web3SendTransactionForTestUser(payload: JsonRpcRequestPayload) {
  const { rawTransaction } = await web3SignTransactionForTestUser(payload);
  return Web3Service.sendRawTransaction(rawTransaction);
}

export async function web3SignTransactionForTestUser(payload: JsonRpcRequestPayload) {
  const { publicAddress } = testModeStore.getState();

  const tx: TransactionConfig = {
    to: payload.params[0].to,
    value: payload.params[0].value,
    data: payload.params[0].data,
    chainId: (await Web3Service.getChainId()) || 1,
  };

  const payloadData = payload.params[0]?.data;
  const defaultGasLimit = payloadData && payloadData !== '0x' && payloadData !== '0x0' ? 91000 : 21000;

  tx.gas = payload.params[0].gas ?? (await Web3Service.estimateGas(tx)) ?? defaultGasLimit;
  tx.gasPrice = payload.params[0].gasPrice ?? (await Web3Service.getGasPrice()) ?? undefined;
  tx.nonce = payload.params[0].nonce ?? (await Web3Service.getTransactionCount(publicAddress!)) ?? undefined;

  const signedTransaction = await testModeStore.dispatch(TestModeWeb3Signers.signTransactionForUser(tx));

  return {
    rawTransaction: signedTransaction.rawTransaction,
    tx: {
      nonce: tx.nonce,
      gasPrice: tx.gasPrice,
      gas: tx.gas,
      to: tx.to,
      value: tx.value,
      v: signedTransaction.v,
      r: signedTransaction.r,
      s: signedTransaction.s,
      hash: signedTransaction.transactionHash,
    },
  };
}
