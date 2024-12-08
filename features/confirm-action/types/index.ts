import { TransactionType } from '~/features/connect-with-ui/utils/transaction-type-utils';

export interface ConfirmActionInfo {
  amount?: string;
  token?: string;
  signer?: string;
  fiat_value?: string;
  token_amount?: string;
  symbol?: string;
  network_label?: string;
  transaction_type?: TransactionType;
  chain_info_uri?: string;
  message?: string; // string (JSON stringified object)
  request_domain?: string;
  nft?: {
    contract_address: string;
    token_id: string;
    token_type: string;
    quantity: number;
  };
  estimatedGasFee?: string;
  email?: string;
  appName?: string;

  // transaction info
  from?: string;
  to?: string;
  value?: string;
  data?: string;

  // chain info
  walletType?: string;
  chainId?: string;

  // magic specific
  networkFee?: string;
  tokenPrice?: string;
  freeTransactionCount?: number; // stability only
}
export enum ConfirmActionType {
  SendTransaction = 'SEND_TRANSACTION',
  SignMessage = 'SIGN_MESSAGE',
  SignTransaction = 'SIGN_TRANSACTION',
  ConfirmTransaction = 'CONFIRM_TRANSACTION',
}

export interface DecodedTctPayload {
  payload: ConfirmActionInfo;
  api_key: string;
  confirmation_id: string;
  action: ConfirmActionType;
  exp: number;
  iat: number;
}
