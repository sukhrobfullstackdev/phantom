import axios, { AxiosError } from 'axios';
import { RestUtilities, RestUtilitiesConfig } from '~/shared/libs/axios/type';

/**
 * Type-guard that determines if the given argument is a valid `AxiosError`.
 */
export function isAxiosError(err: any): err is AxiosError {
  return !!err?.isAxiosError;
}

/**
 * Create a wrapped Axios instance.
 */
export function createRestUtilities<TBaseResponse, TMetadata = any>(
  config: RestUtilitiesConfig<TBaseResponse, TMetadata>,
): RestUtilities<TBaseResponse> {
  const configWithDefaults = {
    requestInterceptor: (cfg: any) => cfg,
    metadataFactory: () => ({}),
    errorTransform: (err: any) => err,
    ...config,
  };

  const axiosInstance = axios.create();

  axiosInstance.interceptors.request.use(source => {
    const cfg = configWithDefaults.requestInterceptor(source);
    cfg.headers['Content-Type'] = 'application/json';
    cfg.errorMetaData = configWithDefaults.metadataFactory(cfg);
    return cfg;
  });

  axiosInstance.interceptors.response.use(
    res => res.data,
    err => Promise.reject(configWithDefaults.errorTransform(err, err?.config?.errorMetaData)),
  );

  return axiosInstance;
}
