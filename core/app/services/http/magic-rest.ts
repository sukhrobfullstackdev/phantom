import { v4 as createUuid } from 'uuid';
import { merge } from '~/app/libs/lodash-utils';
import { getApiKey } from '~/app/libs/api-key';
import { createServiceError } from '~/app/libs/exceptions';
import { getLocaleFromParams } from '~/app/libs/i18n';
import { getBundleId } from '~/app/libs/query-params/getParam/get-bundle-id';
import { getSdk } from '~/app/libs/query-params/getParam/get-sdk';
import { getMeta } from '~/app/libs/query-params/getParam/get-meta';
import { BACKEND_URL } from '~/shared/constants/env';
import { createRestUtilities } from '~/shared/libs/axios/client-side-axios';
import { pickBy } from '~/shared/libs/object-helpers';
import { MagicAPIResponse } from '~/shared/types/magic-api-response';
import { getReferrer } from '../../libs/get-referrer';
import { getNetworkName } from '../../libs/network';
import { store } from '../../store';
import { getMagicSdkVersion } from '~/app/libs/get-magic-sdk-version';
import { addTraceIdToWindow } from '~/app/libs/trace-id';

type HeaderNamespace = 'x-magic';

function getNamespace(): HeaderNamespace {
  return 'x-magic';
}

export const magicRestUtilities = createRestUtilities<MagicAPIResponse>({
  requestInterceptor: config => {
    const referrer = getReferrer();
    const ethNetwork = getNetworkName();
    const { ust, customAuthorizationToken } = store.getState().Auth;
    const apiKey = getApiKey();
    const trace_id = createUuid();
    addTraceIdToWindow(trace_id);
    const locale = getLocaleFromParams();
    const bundleId = getBundleId();
    const meta = getMeta(); // does the base64 encoding, or maybe ASCII stripping
    const sdk = getSdk();

    return merge(
      {
        baseURL: BACKEND_URL,
        withCredentials: true,
        headers: pickBy({
          authorization: ust && `Bearer ${ust}`,
          [`${getNamespace()}-referrer`]: referrer,
          [`${getNamespace()}-api-key`]: apiKey,
          'x-magic-bundle-id': bundleId,
          'x-magic-trace-id': trace_id,
          'x-magic-sdk': sdk,
          'x-magic-sdk-version': getMagicSdkVersion(),
          'x-amzn-trace-id': `Root=${trace_id}`,
          'x-fortmatic-network': ethNetwork,
          'accept-language': locale,
          'x-custom-authorization-token': customAuthorizationToken,
          'x-magic-meta': meta,
        }),
      },

      config,
    );
  },

  metadataFactory: config => ({ endpoint: config.url, trace_id: config.headers?.['x-magic-trace-id'] }),

  errorTransform: (err, metadata) =>
    createServiceError(err.response?.data ?? err, { location: err.response?.headers?.location, ...metadata }),
});
