import { PopulatedTransaction, ethers } from 'ethers';
import { getOptionsFromEndpoint } from '~/app/libs/query-params/per-route-parsers';
import { networksByChainId } from '~/features/connect-with-ui/hooks/chainInfoContext';
import { Endpoint } from '~/server/routes/endpoint';
import {
  FORWARDER_ABI,
  FORWARDER_REQUEST_TYPES,
  MUMBAI_FORWARDER_CONTRACT_ADDRESS,
  POLYGON_FORWARDER_CONTRACT_ADDRESS,
  AMOY_FORWARDER_CONTRACT_ADDRESS,
  GHOSTNET_FORWARDER_CONTRACT_ADDRESS,
} from './constants';
import { EIP712TypedData } from 'eth-sig-util';
import { getNonceAddition } from './get-nonce-addition';
import { getETHNetworkUrl } from '~/app/libs/network';

export type ForwardRequestMessage = {
  from: string;
  to: string;
  value: number;
  gas: number;
  nonce: number;
  data: string;
};

export const buildForwardPayload = async (address: string, transaction: PopulatedTransaction) => {
  if (!transaction.to || !transaction.data) {
    throw new Error('Invalid transaction');
  }

  const { ETH_NETWORK } = getOptionsFromEndpoint(Endpoint.Client.SendLegacy);

  const network = Object.values(networksByChainId).find(nById => {
    return typeof ETH_NETWORK === 'string' ? nById.network === ETH_NETWORK : nById.chainId === ETH_NETWORK?.chainId;
  });

  if (!network) {
    throw new Error('Not supported network');
  }

  const provider = new ethers.providers.JsonRpcProvider(getETHNetworkUrl());
  const contractAddress =
    network.chainId === 137
      ? POLYGON_FORWARDER_CONTRACT_ADDRESS
      : network.chainId === 80001
      ? MUMBAI_FORWARDER_CONTRACT_ADDRESS
      : network.chainId === 80002
      ? AMOY_FORWARDER_CONTRACT_ADDRESS
      : network.chainId === 128123
      ? GHOSTNET_FORWARDER_CONTRACT_ADDRESS
      : null;
  if (contractAddress === null) throw Error(`Unsupported gas subsidy chain ${network.chainId}`);
  const forwarderContract = new ethers.Contract(contractAddress, FORWARDER_ABI, provider);

  const nonce = (await forwarderContract.getNonce(address)).toNumber() as number;

  const { nonce_addition } = await getNonceAddition({
    publicAddress: address,
    chainId: network.chainId,
  });

  const forwardRequestMessage = {
    from: address,
    to: transaction.to,
    value: 0,
    gas: 1e6,
    nonce: nonce + nonce_addition,
    data: transaction.data,
  };

  const typedDataV4Payload: EIP712TypedData = {
    types: FORWARDER_REQUEST_TYPES,
    primaryType: 'ForwardRequest',
    domain: {
      name: 'MagicForwarderV5',
      version: '1',
      verifyingContract: forwarderContract.address,
      chainId: network.chainId,
    },
    message: forwardRequestMessage,
  };

  return typedDataV4Payload;
};
