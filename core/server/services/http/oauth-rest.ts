import { merge } from '~/app/libs/lodash-utils';
import { createHttpError, createOAuthHttpError } from '~/server/libs/exceptions';
import { createServerRestUtilities } from '~/shared/libs/axios/server-side-axios';

export function oauthRestUtilities(provider?: string) {
  return createServerRestUtilities<any, { endpoint?: string; provider?: string }>({
    requestInterceptor: config => {
      return merge({ responseType: 'json' }, config);
    },

    metadataFactory: config => ({ endpoint: config.url, provider }),

    errorTransform: (err, metadata) => {
      const error = err.response?.data?.error;
      const error_description = err.response?.data?.error_description;
      const error_uri = err.response?.data?.error_uri;
      const status = err.response?.status;

      if (error) {
        return createOAuthHttpError({
          status,
          provider: metadata?.provider,
          error,
          errorDescription: error_description,
          errorURI: error_uri,
        });
      }

      return createHttpError({ sourceErrors: err });
    },
  });
}
