import { JsonRpcRequestPayload } from 'magic-sdk';
import { TransactionConfig } from 'web3-core';
import {
  ETH_CALL,
  ETH_CHAINID,
  ETH_ESTIMATEGAS,
  ETH_GASPRICE,
  ETH_GETBALANCE,
  ETH_GETBLOCKBYNUMBER,
  ETH_GETCODE,
  ETH_GETTRANSACTIONCOUNT,
  ETH_SENDRAWTRANSACTION,
  NET_VERSION,
} from '~/app/constants/eth-rpc-methods';
import { JsonRpcService } from '../json-rpc';

function createJsonRpcRequestPayload(method: string, params: any[] = []): JsonRpcRequestPayload {
  return {
    jsonrpc: '2.0',
    id: '1',
    method,
    params,
  };
}

export async function getTransactionCount(publicAddress: string, block = 'latest') {
  return JsonRpcService.ethereumProxy<number>(
    createJsonRpcRequestPayload(ETH_GETTRANSACTIONCOUNT, [publicAddress, block]),
  );
}

export async function getGasPrice() {
  return JsonRpcService.ethereumProxy<string>(createJsonRpcRequestPayload(ETH_GASPRICE));
}

export async function estimateGas(tx: TransactionConfig) {
  return JsonRpcService.ethereumProxy<number>(createJsonRpcRequestPayload(ETH_ESTIMATEGAS, [tx]));
}

export async function getNetworkId() {
  return JsonRpcService.ethereumProxy<number>(createJsonRpcRequestPayload(NET_VERSION));
}
export async function getChainId() {
  return JsonRpcService.ethereumProxy<number>(createJsonRpcRequestPayload(ETH_CHAINID));
}

export async function sendRawTransaction(rawTxn?: string) {
  return JsonRpcService.ethereumProxy<string>(createJsonRpcRequestPayload(ETH_SENDRAWTRANSACTION, [rawTxn]));
}

export async function getBalance(address?: string) {
  return JsonRpcService.ethereumProxy<any>(createJsonRpcRequestPayload(ETH_GETBALANCE, [address, 'latest']));
}

export async function ethCall(to: string, data: string) {
  return JsonRpcService.ethereumProxy<any>(
    createJsonRpcRequestPayload(ETH_CALL, [
      {
        from: null,
        to,
        data,
      },
      'latest',
    ]),
  );
}

export async function getCode(address?: string) {
  return JsonRpcService.ethereumProxy<any>(createJsonRpcRequestPayload(ETH_GETCODE, [address, 'latest']));
}

export async function getBlock(blockHashOrBlockNumber = 'latest', isReturnAllTransaction = false) {
  return JsonRpcService.ethereumProxy<string>(
    createJsonRpcRequestPayload(ETH_GETBLOCKBYNUMBER, [blockHashOrBlockNumber, isReturnAllTransaction]),
  );
}
