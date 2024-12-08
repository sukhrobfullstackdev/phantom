import { merge } from '~/app/libs/lodash-utils';
import { createHttpError } from '~/server/libs/exceptions';
import { MagicAPIResponse } from '~/shared/types/magic-api-response';
import { INTERNAL_API_URL } from '~/server/constants/internal-api-url';
import { DEPLOY_ENV } from '~/shared/constants/env';
import { createServerRestUtilities } from '~/shared/libs/axios/server-side-axios';

const doNotForwardStatuses = [404];

export const internalMagicRestUtilities = createServerRestUtilities<MagicAPIResponse>({
  requestInterceptor: config => {
    return merge(
      {
        baseURL: INTERNAL_API_URL[DEPLOY_ENV],
        withCredentials: true,
      },

      config,
    );
  },

  metadataFactory: config => ({ endpoint: config.url }),

  errorTransform: err => {
    const message = err.response?.data?.message;
    const error_code = err.response?.data?.error_code;
    const status = err.response?.status;

    if (message && error_code && status && !doNotForwardStatuses.includes(status)) {
      return createHttpError({
        status,
        errorCode: error_code,
        message,
      });
    }

    return createHttpError({ sourceErrors: err });
  },
});
