/**
 * Create a wrapped Axios instance.
 */
import axios from 'axios';
import { RestUtilities, RestUtilitiesConfig } from '~/shared/libs/axios/type';
import { serverLogger } from '~/server/libs/datadog';

export function createServerRestUtilities<TBaseResponse, TMetadata = any>(
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
    cfg.errorMetaData = configWithDefaults.metadataFactory(cfg);
    return cfg;
  });

  axiosInstance.interceptors.request.use(
    requestCfg => {
      serverLogger.info('Outgoing API Request:', { request: requestCfg });
      return requestCfg;
    },
    err => {
      serverLogger.error('Outgoing API Request Failed:', { err });
      return Promise.reject(err);
    },
  );

  axiosInstance.interceptors.response.use(
    res => {
      const { config, data, headers } = res;
      serverLogger.info('Outgoing API Response:', { config, data, headers });
      return data;
    },

    err => {
      serverLogger.error('Outgoing API Response Failed:', { err });
      return Promise.reject(configWithDefaults.errorTransform(err, err?.config?.errorMetaData));
    },
  );

  return axiosInstance;
}
