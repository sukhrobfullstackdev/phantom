import { merge } from '~/app/libs/lodash-utils';
import { createServiceError } from '~/app/libs/exceptions';
import { NFT_API_URL } from '~/shared/constants/env';
import { createRestUtilities } from '~/shared/libs/axios/client-side-axios';
import { pickBy } from '~/shared/libs/object-helpers';

export const nftRestUtilities = createRestUtilities({
  requestInterceptor: config => {
    return merge(
      {
        baseURL: NFT_API_URL,
        withCredentials: false,
        headers: pickBy({
          'Content-Type': 'application/json',
        }),
      },

      config,
    );
  },

  metadataFactory: config => ({ endpoint: config.url, trace_id: config.headers?.['x-magic-trace-id'] }),

  errorTransform: (err, metadata) =>
    createServiceError(err.response?.data ?? err, { location: err.response?.headers?.location, ...metadata }),
});
