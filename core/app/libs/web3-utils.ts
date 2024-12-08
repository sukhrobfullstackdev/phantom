import { cloneDeep, isEmpty, includes, omit } from '~/app/libs/lodash-utils';
import { ethers } from 'ethers';
import { AnalyticsActionType, trackAction } from '~/app/libs/analytics';
import { getDefaultGasLimit } from '~/app/libs/gas-price-analyze';
import { TransactionFeeService } from '~/app/services/transaction-fee';
import { getTransactionFeeV1EVMChain } from '~/app/services/transaction-fee/get-transaction-fee';
import { Web3Service } from '~/app/services/web3';
import { networksByChainId } from '~/features/connect-with-ui/hooks/chainInfoContext';
import { add, divide, multiply, subtract } from '~/features/connect-with-ui/utils/bn-math';
import { Endpoint } from '~/server/routes/endpoint';
import {
  ETH_SENDTRANSACTION,
  ETH_SEND_GASLESS_TRANSACTION,
  ETH_SIGN,
  ETH_SIGNTRANSACTION,
  ETH_SIGNTYPEDDATA,
  ETH_SIGNTYPEDDATA_V3,
  ETH_SIGNTYPEDDATA_V4,
  PERSONAL_SIGN,
} from '../constants/eth-rpc-methods';
import { store } from '../store';
import { getApiKey } from './api-key';
import { getChainId, getCustomNodeNetworkUrl, getLedgerNodeUrl, getNetworkName, getWalletType } from './network';
import { getOptionsFromEndpoint } from './query-params';
import { getLogger } from '~/app/libs/datadog';
import { getErrorMessage } from '~/app/libs/exceptions/error-handler';
import { buildMessageContext } from '~/app/libs/analytics-datadog-helpers';

/**
 * Compare a list of addresses. Returns `true` if all addresses are equal by
 * their checksum, otherwise returns `false`.
 */
export function compareAddresses(addresses: (string | undefined)[]) {
  if (isEmpty(addresses)) return false;
  const checksums = addresses.map(addr => toChecksumAddress(addr || '0x0'));
  return checksums.every(addr => addr === checksums[0]);
}

export function toChecksumAddress(address: string | null): string | null {
  if (address === null) return null;
  let checksumAddress: string | null;

  try {
    checksumAddress = ethers.utils.getAddress(address);
  } catch {
    checksumAddress = null;
  }

  return checksumAddress;
}

export function trackBlockchainSignedEvent(payload, getState, hasResult) {
  const SignedTransactionEvent = [
    ETH_SENDTRANSACTION,
    PERSONAL_SIGN,
    ETH_SIGN,
    ETH_SIGNTYPEDDATA,
    ETH_SIGNTYPEDDATA_V3,
    ETH_SIGNTYPEDDATA_V4,
    ETH_SIGNTRANSACTION,
    ETH_SEND_GASLESS_TRANSACTION,
  ];
  const { Auth } = getState();

  if (hasResult && includes(SignedTransactionEvent, payload.method)) {
    const properties = {
      publicAddress: Auth.userKeys.publicAddress,
      clientID: Auth.clientID,
      walletType: getWalletType(),
      method: payload.method,
      nodeUrl: getCustomNodeNetworkUrl(),
      network: getNetworkName(),
    };

    trackAction(AnalyticsActionType.TransactionSigned, properties);
  }
}

export async function standardizePolygonPayload(payload, chainIdNumber, Auth) {
  const { maxPriorityFeePerGas, maxFeePerGas, gas, gasPrice } = payload.params[0];

  const tx = {
    to: payload.params[0].to,
    value: payload.params[0].value,
    data: payload.params[0].data,
    chainId: chainIdNumber,
  } as any;

  let defaultGasLimit;
  try {
    defaultGasLimit = (await getDefaultGasLimit(payload)).gasLimit;
  } catch (simulationFails) {
    const payloadData = payload.params[0]?.data;
    defaultGasLimit = ethers.utils.hexlify(
      payloadData && payloadData !== '0x' && payloadData !== '0x0' ? 91000 : 21000,
    );
  }

  if (maxPriorityFeePerGas) {
    tx.maxPriorityFeePerGas = maxPriorityFeePerGas;
    tx.maxFeePerGas = maxFeePerGas;
  } else if (gasPrice) {
    tx.gasPrice = gasPrice;
  } else {
    const network = networksByChainId[chainIdNumber];

    try {
      const transactionFee = await getTransactionFeeV1EVMChain(network?.gasStationUrl);

      tx.maxPriorityFeePerGas = ethers.utils.parseUnits(
        transactionFee?.fast.maxPriorityFee.toString().slice(0, 12),
        'gwei',
      )._hex;
      tx.maxFeePerGas = ethers.utils.parseUnits(transactionFee?.fast.maxFee.toString().slice(0, 12), 'gwei')._hex;
    } catch (e) {
      tx.gasPrice = (await Web3Service.getGasPrice()) ?? undefined;
    }
  }
  tx.nonce =
    payload.params[0].nonce ?? (await Web3Service.getTransactionCount(Auth.userKeys.publicAddress!)) ?? undefined;
  tx.gas = gas ?? defaultGasLimit;

  return tx;
}

export async function standardizeBNBChainPayload(payload, chainIdNumber, Auth) {
  const tx = {
    to: payload.params[0].to,
    value: payload.params[0].value,
    data: payload.params[0].data,
    from: Auth.userKeys.publicAddress,
  } as any;

  const payloadData = payload.params[0]?.data;
  const defaultGasLimit = ethers.utils.hexlify(
    payloadData && payloadData !== '0x' && payloadData !== '0x0' ? 91000 : 21000,
  );

  try {
    tx.gasLimit = payload.params[0].gas ?? (await Web3Service.estimateGas(tx)) ?? defaultGasLimit;
  } catch (e) {
    // An error here will mean the transaction was invalid
    // such as transferring more ETH than you have)
    getLogger().error(`Error calculating network fee`, buildMessageContext(e));
    tx.gasLimit = defaultGasLimit;
  }
  tx.chainId = chainIdNumber;

  const { maxPriorityFeePerGas, maxFeePerGas } = payload.params[0];

  if (maxPriorityFeePerGas) {
    tx.maxPriorityFeePerGas = maxPriorityFeePerGas;
    tx.maxFeePerGas = maxFeePerGas;
  } else {
    tx.maxPriorityFeePerGas = ethers.utils.parseUnits('3', 'gwei')._hex;
    tx.maxFeePerGas = ethers.utils.parseUnits('10', 'gwei')._hex;
  }

  tx.nonce =
    payload.params[0].nonce ?? (await Web3Service.getTransactionCount(Auth.userKeys.publicAddress!)) ?? undefined;

  return tx;
}

export async function standardizeEthereumPayload(payload, chainIdNumber, Auth) {
  const tx = {
    to: payload.params[0].to,
    value: payload.params[0].value,
    data: payload.params[0].data,
    from: Auth.userKeys.publicAddress,
  } as any;

  const payloadData = payload.params[0]?.data;
  const defaultGasLimit = ethers.utils.hexlify(
    payloadData && payloadData !== '0x' && payloadData !== '0x0' ? 91000 : 21000,
  );

  try {
    tx.gas = payload.params[0].gas ?? (await Web3Service.estimateGas(tx)) ?? defaultGasLimit;
  } catch (e) {
    // An error here will mean the transaction was invalid
    // such as transferring more ETH than you have)
    getLogger().error(`Error calculating network fee`, buildMessageContext(e));
    tx.gas = defaultGasLimit;
  }
  tx.chainId = chainIdNumber;

  const { maxPriorityFeePerGas, maxFeePerGas } = payload.params[0];

  if (maxPriorityFeePerGas) {
    tx.maxPriorityFeePerGas = maxPriorityFeePerGas;
    tx.maxFeePerGas = maxFeePerGas;
  } else if (payload.params[0].gasPrice) {
    tx.gasPrice = payload.params[0].gasPrice;
  } else {
    try {
      const blockPrice = await TransactionFeeService.getGasPriceEstimationRetrieve();

      tx.maxPriorityFeePerGas = ethers.utils.parseUnits(
        blockPrice?.data.estimatedPrices[0].maxPriorityFeePerGas.toString(),
        'gwei',
      )._hex;
      tx.maxFeePerGas = ethers.utils.parseUnits(
        blockPrice?.data.estimatedPrices[0].maxFeePerGas.toString(),
        'gwei',
      )._hex;
    } catch (e) {
      tx.gasPrice = (await Web3Service.getGasPrice()) ?? undefined;
    }
  }

  tx.nonce =
    payload.params[0].nonce ?? (await Web3Service.getTransactionCount(Auth.userKeys.publicAddress!)) ?? undefined;

  return tx;
}

export async function standardizeOptimismPayload(payload, chainIdNumber, Auth) {
  const tx = {
    to: payload.params[0].to,
    value: payload.params[0].value,
    data: payload.params[0].data,
    from: Auth.userKeys.publicAddress,
  } as any;

  const payloadData = payload.params[0]?.data;
  const defaultGasLimit = ethers.utils.hexlify(
    payloadData && payloadData !== '0x' && payloadData !== '0x0' ? 91000 : 21000,
  );

  try {
    tx.gas = payload.params[0].gas ?? (await Web3Service.estimateGas(tx)) ?? defaultGasLimit;
  } catch (e) {
    // An error here will mean the transaction was invalid
    // such as transferring more ETH than you have)
    getLogger().error(`Error calculating network fee`, buildMessageContext(e));
    tx.gas = defaultGasLimit;
  }
  tx.chainId = chainIdNumber;

  const { maxPriorityFeePerGas, maxFeePerGas } = payload.params[0];

  if (maxPriorityFeePerGas) {
    tx.maxPriorityFeePerGas = maxPriorityFeePerGas;
    tx.maxFeePerGas = maxFeePerGas;
  } else if (payload.params[0].gasPrice) {
    tx.gasPrice = payload.params[0].gasPrice;
  } else {
    try {
      const httpsProvider = new ethers.providers.JsonRpcProvider(getCustomNodeNetworkUrl());
      const feeData = await httpsProvider.getFeeData();

      if (!feeData || !feeData?.maxFeePerGas || !feeData?.maxPriorityFeePerGas) {
        getLogger().error(`Error calculating network fee`, buildMessageContext('Fee Data undefined'));
        throw new Error('Fee Data undefined');
      }
      tx.maxPriorityFeePerGas = ethers.utils.hexlify(feeData.maxPriorityFeePerGas);
      tx.maxFeePerGas = ethers.utils.hexlify(feeData.maxFeePerGas);
    } catch (e) {
      tx.gasPrice = (await Web3Service.getGasPrice()) ?? undefined;
    }
  }

  tx.nonce =
    payload.params[0].nonce ?? (await Web3Service.getTransactionCount(Auth.userKeys.publicAddress!)) ?? undefined;

  return tx;
}

export async function standardizeChilizPayload(payload, chainIdNumber, Auth) {
  const tx = {
    to: payload.params[0].to,
    value: payload.params[0].value,
    data: payload.params[0].data,
    from: Auth.userKeys.publicAddress,
  } as any;

  const payloadData = payload.params[0]?.data;
  const defaultGasLimit = ethers.utils.hexlify(
    payloadData && payloadData !== '0x' && payloadData !== '0x0' ? 91000 : 21000,
  );

  try {
    tx.gas = payload.params[0].gas ?? (await Web3Service.estimateGas(tx)) ?? defaultGasLimit;
  } catch (e) {
    // An error here will mean the transaction was invalid
    // such as transferring more funds than you have)
    getLogger().error(`Error calculating network fee`, buildMessageContext(e));
    tx.gas = defaultGasLimit;
  }
  tx.chainId = chainIdNumber;

  const { maxPriorityFeePerGas, maxFeePerGas } = payload.params[0];

  if (maxPriorityFeePerGas) {
    tx.maxPriorityFeePerGas = maxPriorityFeePerGas;
    tx.maxFeePerGas = maxFeePerGas;
  } else if (payload.params[0].gasPrice) {
    tx.gasPrice = payload.params[0].gasPrice;
  } else {
    try {
      const httpsProvider = new ethers.providers.JsonRpcProvider(getCustomNodeNetworkUrl());
      const feeData = await httpsProvider.getFeeData();

      if (!feeData || !feeData?.maxFeePerGas || !feeData?.maxPriorityFeePerGas) {
        getLogger().error(`Error calculating network fee`, buildMessageContext('Fee Data undefined'));
        throw new Error('Fee Data undefined');
      }
      tx.maxPriorityFeePerGas = ethers.utils.hexlify(feeData.maxPriorityFeePerGas);
      tx.maxFeePerGas = ethers.utils.hexlify(feeData.maxFeePerGas);
    } catch (e) {
      tx.gasPrice = (await Web3Service.getGasPrice()) ?? undefined;
    }
  }

  tx.nonce =
    payload.params[0].nonce ?? (await Web3Service.getTransactionCount(Auth.userKeys.publicAddress!)) ?? undefined;

  return tx;
}

const parseToDecimalString = (value: string | number | bigint) => {
  if (typeof value === 'string' && value.startsWith('0x')) {
    return parseInt(value, 16).toString(10);
  }
  return value.toString(10);
};

const toNumber = (value: any, defaultValue = 0) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? defaultValue : parsed;
};

export async function standardizePOAPayload(payload: any, chainIdNumber: number, Auth: any) {
  const tx = payload.params[0];

  const type = tx?.type ? toNumber(tx?.type) : undefined;
  const chainId = chainIdNumber;
  const value = tx?.value ? parseToDecimalString(tx?.value) : '0';
  const nonce = tx?.nonce
    ? toNumber(tx.nonce)
    : (await Web3Service.getTransactionCount(Auth.userKeys.publicAddress)) ?? 0;

  const standardized = {
    ...tx,
    ...(type ? { type } : {}),
    nonce,
    chainId,
    value,
  };

  return standardized;
}

// Note.
// - Stability chain is working without gas fee
// - Support EIP-1559 only

const STABILITY_MAX_GAS_LIMIT = 260000000;

const standardizeStabilityPayload = async (payload: any, chainIdNumber: number, Auth: any) => {
  const tx = payload.params[0];

  const from = tx?.from ?? (Auth.userKeys.publicAddress as string); // the default from is the user's address
  const chainId = chainIdNumber;
  const value = ethers.BigNumber.from(tx?.value ?? '0').toHexString();
  const nonce = ethers.BigNumber.from(tx?.nonce ?? (await Web3Service.getTransactionCount(from)) ?? 0).toNumber();
  const data = tx?.data ?? '0x12';
  const gasLimit = tx?.gas ?? ethers.BigNumber.from(STABILITY_MAX_GAS_LIMIT).toHexString(); // The gasLimit should be 21016 or higher
  const maxFeePerGas = tx?.maxFeePerGas ?? '0x0';
  const maxPriorityFeePerGas = tx?.maxPriorityFeePerGas ?? '0x0';

  const standardized = {
    ...tx,
    from,
    nonce,
    chainId,
    value,
    data,
    gasLimit,
    maxFeePerGas,
    maxPriorityFeePerGas,
  };

  if (typeof tx?.type !== 'undefined' && tx.type === 0) {
    standardized.type = 2;
  }

  if (typeof tx?.gasPrice !== 'undefined') {
    delete standardized.gasPrice;
  }

  return standardized;
};

export async function standardizeZkSyncPayload(payload, chainIdNumber, Auth) {
  const tx = {
    to: payload.params[0].to,
    value: payload.params[0].value,
    data: payload.params[0].data,
    from: Auth.userKeys.publicAddress,
  } as any;

  const payloadData = payload.params[0]?.data;
  const defaultGasLimit = ethers.utils.hexlify(
    payloadData && payloadData !== '0x' && payloadData !== '0x0' ? 91000 : 21000,
  );

  try {
    tx.gas = payload.params[0].gas ?? (await Web3Service.estimateGas(tx)) ?? defaultGasLimit;
  } catch (e) {
    // An error here will mean the transaction was invalid
    // such as transferring more funds than you have)
    getLogger().error(`Error calculating network fee`, buildMessageContext(e));
    tx.gas = defaultGasLimit;
  }
  tx.chainId = chainIdNumber;

  const { maxPriorityFeePerGas, maxFeePerGas } = payload.params[0];

  if (maxPriorityFeePerGas) {
    tx.maxPriorityFeePerGas = maxPriorityFeePerGas;
    tx.maxFeePerGas = maxFeePerGas;
  } else if (payload.params[0].gasPrice) {
    tx.gasPrice = payload.params[0].gasPrice;
  } else {
    try {
      const httpsProvider = new ethers.providers.JsonRpcProvider(getCustomNodeNetworkUrl());
      const feeData = await httpsProvider.getFeeData();

      if (!feeData || !feeData?.maxFeePerGas || !feeData?.maxPriorityFeePerGas) {
        getLogger().error(`Error calculating network fee`, buildMessageContext('Fee Data undefined'));
        throw new Error('Fee Data undefined');
      }
      tx.maxPriorityFeePerGas = ethers.utils.hexlify(feeData.maxPriorityFeePerGas);
      tx.maxFeePerGas = ethers.utils.hexlify(feeData.maxFeePerGas);
    } catch (e) {
      tx.gasPrice = (await Web3Service.getGasPrice()) ?? undefined;
    }
  }

  tx.nonce =
    payload.params[0].nonce ?? (await Web3Service.getTransactionCount(Auth.userKeys.publicAddress!)) ?? undefined;

  return tx;
}

const standardizeArbitrumPayload = async (payload: any, chainIdNumber: number, Auth: any) => {
  const tx = payload.params[0];

  const type = toNumber(tx?.type, 2);

  let gasLimit: ethers.BigNumber;
  try {
    if (ethers.BigNumber.isBigNumber(tx?.gas)) {
      gasLimit = ethers.BigNumber.from(tx?.gas);
    } else {
      const { gasLimit: defaultGasLimit } = await getDefaultGasLimit(payload);
      gasLimit = ethers.BigNumber.from(defaultGasLimit ?? (tx?.data ? 52000 : 21000));
    }
  } catch (e) {
    gasLimit = ethers.BigNumber.from(tx?.data ? 52000 : 21000);
  }

  // eip-1559
  try {
    const httpsProvider = new ethers.providers.JsonRpcProvider(getCustomNodeNetworkUrl());
    const feeData = await httpsProvider.getFeeData();

    if (type === 2) {
      const maxFeePerGas = tx?.maxFeePerGas ?? feeData.maxFeePerGas?.toHexString();
      const maxPriorityFeePerGas = tx?.maxPriorityFeePerGas ?? feeData.maxPriorityFeePerGas?.toHexString();

      const standardized = {
        ...tx,
        gasLimit: gasLimit.toHexString(),
        maxFeePerGas,
        maxPriorityFeePerGas,
      };

      return omit(standardized, ['gasPrice', 'gas']);
    }

    const gasPrice = tx?.gasPrice ?? feeData.gasPrice?.toHexString();

    const standardized = {
      ...tx,
      gasLimit: gasLimit.toHexString(),
      gasPrice,
    };

    return omit(standardized, ['maxFeePerGas', 'maxPriorityFeePerGas']);
  } catch (e) {
    getLogger().warn(`Error calculating network fee`, buildMessageContext(e));
    return { ...tx, gasLimit: gasLimit.toHexString() };
  }
};

const standardizeEtherlinkPayload = async (payload: any, chainIdNumber: number, Auth: any) => {
  // Network doesn't support eip-1559
  let gasLimit: string;
  try {
    gasLimit =
      (payload.params[0].gasLimit || payload.params[0].gas) ??
      // @ts-ignore returns hex
      ((await Web3Service.estimateGas(payload.params[0])) as string);
  } catch (e) {
    const payloadData = payload.params[0]?.data;
    // Tezos gas limit values are different from Ethereum
    gasLimit = ethers.utils.hexlify(payloadData && payloadData !== '0x' && payloadData !== '0x0' ? 2500000 : 621000);
  }

  const gasPrice = payload?.params[0].gasPrice ?? (await Web3Service.getGasPrice());
  const nonce =
    payload.params[0].nonce ?? (await Web3Service.getTransactionCount(Auth.userKeys.publicAddress)) ?? undefined;

  const tx = {
    ...payload?.params[0],
    chainId: chainIdNumber,
    gasLimit,
    gasPrice,
    nonce,
  };

  return tx;
};

const standardizeBASEPayload = async (payload: any, chainIdNumber: number, Auth: any) => {
  const tx = payload.params[0];

  const type = toNumber(tx?.type, tx?.gasPrice ? 0 : 2);

  try {
    let gasLimit: ethers.BigNumber;
    if (ethers.BigNumber.isBigNumber(tx?.gas)) {
      gasLimit = ethers.BigNumber.from(tx?.gas);
    } else {
      const { gasLimit: defaultGasLimit } = await getDefaultGasLimit(payload);
      gasLimit = ethers.BigNumber.from(defaultGasLimit ?? (tx?.data ? 52000 : 21000));
    }

    const httpsProvider = new ethers.providers.JsonRpcProvider(getCustomNodeNetworkUrl());
    const feeData = await httpsProvider.getFeeData();

    // EIP-1559
    if (type === 2) {
      const maxFeePerGas =
        tx?.maxFeePerGas && !ethers.BigNumber.from(tx.maxFeePerGas).isZero()
          ? ethers.BigNumber.from(tx.maxFeePerGas)
          : feeData.maxFeePerGas;

      const maxPriorityFeePerGas =
        tx?.maxPriorityFeePerGas && !ethers.BigNumber.from(tx.maxPriorityFeePerGas).isZero()
          ? ethers.BigNumber.from(tx.maxPriorityFeePerGas)
          : feeData.maxPriorityFeePerGas;

      if (!maxFeePerGas || !maxPriorityFeePerGas) {
        throw new Error('Fee Data undefined');
      }

      const standardized: Record<string, any> = {
        ...tx,
        type,
        gasLimit: gasLimit.toHexString(),
        maxFeePerGas: maxFeePerGas.toHexString(),
        maxPriorityFeePerGas: maxPriorityFeePerGas.toHexString(),
      };

      return omit(standardized, ['gasPrice', 'gas']);
    }

    // Legacy
    const gasPrice = tx?.gasPrice ?? feeData.gasPrice?.toHexString();

    const standardized: Record<string, any> = {
      ...tx,
      type,
      gasLimit: gasLimit.toHexString(),
      gasPrice,
    };

    return omit(standardized, ['maxFeePerGas', 'maxPriorityFeePerGas', 'gas']);
  } catch (e) {
    const standardized: Record<string, any> = {
      ...tx,
      gasLimit: ethers.BigNumber.from(tx?.data ? 52000 : 21000).toHexString(),
      maxFeePerGas: ethers.BigNumber.from(1020000000),
      maxPriorityFeePerGas: ethers.BigNumber.from(1000000000),
    };

    return omit(standardized, ['gasPrice', 'gas']);
  }
};

export const standardizePayload = {
  Polygon: standardizePolygonPayload,
  Ethereum: standardizeEthereumPayload,
  Optimism: standardizeOptimismPayload,
  Zeta: standardizeEthereumPayload,
  Chiliz: standardizeChilizPayload,
  POA: standardizePOAPayload,
  Stability: standardizeStabilityPayload,
  BNB: standardizeBNBChainPayload,
  BASE: standardizeBASEPayload,
  Arbitrum: standardizeArbitrumPayload,
  zkSync: standardizeZkSyncPayload,
  etherlink: standardizeEtherlinkPayload,
};

export async function calculateNetworkFee(payload, isConstructTxFlow = false) {
  const { Auth } = store.getState();
  const chainId = (await Web3Service.getChainId()) as any;
  const chainIdNumber = Number(chainId) || 1;

  const network = networksByChainId[chainIdNumber];

  const standardizedPayload = await standardizePayload[network?.transactionFormat](
    cloneDeep(payload),
    chainIdNumber,
    Auth,
  );

  const { maxPriorityFeePerGas, maxFeePerGas, gas, gasPrice, gasLimit } = standardizedPayload;
  const estimatedGas = gas || gasLimit;

  let transactionFee;

  if (typeof maxPriorityFeePerGas !== 'undefined' && typeof maxFeePerGas !== 'undefined') {
    if (isConstructTxFlow) {
      // For construct tx flow, estimate network fee using maxFeePerGas
      transactionFee = multiply(Number(maxFeePerGas).toString(), Number(estimatedGas).toString());
    } else {
      // For non-construct tx flow, estimate network fee as usual
      const baseFee = divide(subtract(Number(maxFeePerGas).toString(), Number(maxPriorityFeePerGas).toString()), 2);
      const gasPriceInTransaction = add(Number(maxPriorityFeePerGas).toString(), baseFee);
      transactionFee = multiply(gasPriceInTransaction, Number(estimatedGas).toString());
    }
  } else {
    transactionFee = multiply(Number(estimatedGas).toString(), Number(gasPrice).toString());
  }

  return transactionFee;
}

/**
 * Will track the rpc channel started event
 * attaching web3 setup information.
 */
export function trackRpcChannelStarted() {
  try {
    const { ext } = getOptionsFromEndpoint(Endpoint.Client.SendLegacy);
    trackAction(AnalyticsActionType.RpcChannelStarted, {
      ...Object.keys((ext as any) || {}).reduce((acc, key) => ({ ...acc, [key]: true }), {}),
      apiKey: getApiKey(),
      chainId: getChainId(),
      nodeUrl: getLedgerNodeUrl(),
      walletType: getWalletType(),
    });
  } catch (e) {
    // failed to track event.
    getLogger().error(`Error with trackRpcChannelStarted`, { message: getErrorMessage(e) });
  }
}
