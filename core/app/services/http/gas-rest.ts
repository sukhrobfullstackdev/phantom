import { merge } from '~/app/libs/lodash-utils';
import { createServiceError } from '~/app/libs/exceptions';
import { GAS_API_URL } from '~/shared/constants/env';
import { pickBy } from '~/shared/libs/object-helpers';
import { store } from '../../store';
import { createRestUtilities } from '~/shared/libs/axios/client-side-axios';

export type GasApiResponse = {
  success: boolean;
  request_id: string;
  state: string;
  error_message?: string;
};

export const gasRestUtilities = createRestUtilities({
  requestInterceptor: config => {
    const { userID } = store.getState().Auth;

    return merge(
      {
        baseURL: GAS_API_URL,
        withCredentials: false,
        headers: pickBy({
          'Content-Type': 'application/json',
          'x-magic-auth-user-id': userID,
        }),
      },

      config,
    );
  },

  metadataFactory: config => ({ endpoint: config.url, trace_id: config.headers?.['x-magic-trace-id'] }),

  errorTransform: (err, metadata) =>
    createServiceError(err.response?.data ?? err, { location: err.response?.headers?.location, ...metadata }),
});
