import { AxiosError, AxiosRequestConfig } from 'axios';

/**
 * Custom/narrowed type interface for Axios.
 */
export interface RestUtilities<TBaseResponse> {
  /* eslint-disable prettier/prettier */
  get<TResponse extends TBaseResponse = any>(endpoint: string, config?: AxiosRequestConfig): Promise<TResponse>;
  delete<TResponse extends TBaseResponse = any>(endpoint: string, config?: AxiosRequestConfig): Promise<TResponse>;
  head<TResponse extends TBaseResponse = any>(endpoint: string, config?: AxiosRequestConfig): Promise<TResponse>;
  options<TResponse extends TBaseResponse = any>(endpoint: string, config?: AxiosRequestConfig): Promise<TResponse>;
  post<TBody = any, TResponse extends TBaseResponse = any>(
    endpoint: string,
    data?: TBody,
    config?: AxiosRequestConfig,
  ): Promise<TResponse>;
  put<TBody = any, TResponse extends TBaseResponse = any>(
    endpoint: string,
    data?: TBody,
    config?: AxiosRequestConfig,
  ): Promise<TResponse>;
  patch<TBody = any, TResponse extends TBaseResponse = any>(
    endpoint: string,
    data?: TBody,
    config?: AxiosRequestConfig,
  ): Promise<TResponse>;
  /* eslint-enable prettier/prettier */
}

export interface ErrorTransform<TData, TMetadata = any> {
  (err: AxiosError<TData>, errorMetaData?: TMetadata): Error;
}

export interface RestUtilitiesConfig<TData, TMetadata = any> {
  requestInterceptor?: (config: AxiosRequestConfig) => AxiosRequestConfig;
  metadataFactory?: (config: AxiosRequestConfig) => TMetadata;
  errorTransform?: ErrorTransform<TData, TMetadata>;
}
