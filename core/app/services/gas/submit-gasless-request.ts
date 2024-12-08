import { EIP712TypedData } from 'eth-sig-util';
import { HttpService } from '../http';
import { GasApiResponse } from '../http/gas-rest';

type GasApiSubmitGaslessRequestParams = {
  public_address: string;
  signature: string;
  request_payload: EIP712TypedData['message'];
  contract_address: string;
  chain_id: number;
  magic_client_id: string;
};

export type SubmitGaslessRequestParams = {
  address: string;
  payload: EIP712TypedData;
  signedTransaction: string;
  magicClientId: string;
};

export const submitGaslessRequest = async ({
  address,
  payload,
  signedTransaction,
  magicClientId,
}: SubmitGaslessRequestParams) => {
  const endpoint = 'v1/relayer/submit-gasless-request';

  if (!payload.domain.verifyingContract || !payload.domain.chainId) {
    throw new Error('Invalid payload');
  }

  const response = HttpService.gas.post<GasApiSubmitGaslessRequestParams, GasApiResponse>(endpoint, {
    public_address: address,
    signature: signedTransaction,
    request_payload: payload.message,
    contract_address: payload.message.to,
    chain_id: typeof payload.domain.chainId === 'number' ? payload.domain.chainId : Number(payload.domain.chainId),
    magic_client_id: magicClientId,
  });

  return response;
};
