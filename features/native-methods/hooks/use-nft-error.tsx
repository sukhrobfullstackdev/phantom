import { useSharedState } from '~/features/native-methods/hooks/use-shared-data';

export const NFT_ERROR_TYPES = {
  INVALID_PARAMS: 'invalid-params',
  PAYMENT_FAILED: 'payment-failed',
  SOLD_OUT: 'sold-out',
  INSUFFICIENT_FUNDS: 'insufficient-funds',
  NOT_SUPPORTED_TOKEN_STANDARD: 'not-supported-token-standard',
  INTERNAL_SERVER_ERROR: 'internal-server-error',
  SOMETHING_WENT_WRONG: 'something-went-wront',
} as const;

export type NFTErrorType = (typeof NFT_ERROR_TYPES)[keyof typeof NFT_ERROR_TYPES];

export const useNFTError = () => {
  const [errorType, setErrorType] = useSharedState<NFTErrorType | string>(
    ['nft-error'],
    NFT_ERROR_TYPES.SOMETHING_WENT_WRONG,
  );

  return { errorType, setErrorType };
};

export class NFTTransactionError extends Error {
  message: string;
  code: string;
  reason: string;

  constructor(message: string, code: string, reason: string) {
    super(message);
    this.message = message;
    this.code = code;
    this.reason = reason;
  }
}

export class NFTError extends Error {
  message: NFTErrorType;

  constructor(message: NFTErrorType) {
    super(message);
    this.message = message;
  }
}
