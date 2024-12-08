import { HttpError } from 'http-errors';
import { AuthRelayerErrorCode } from './auth-relayer-server-error-codes';

export interface AuthRelayerHttpError<TData extends {} = any> extends HttpError {
  error_code: AuthRelayerErrorCode | string;
  nested_errors: Error[];
  data: TData;
}

export type OAuthHttpError = AuthRelayerHttpError<{
  oauth: {
    provider: string;
    error: string;
    error_description: string;
    error_uri?: string;
  };
}>;
