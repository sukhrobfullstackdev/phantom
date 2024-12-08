import { v4 as createUuid } from 'uuid';
import { merge } from '~/app/libs/lodash-utils';
import { getApiKey } from '~/app/libs/api-key';
import { createServiceError } from '~/app/libs/exceptions';
import { getLocaleFromParams } from '~/app/libs/i18n';
import { parseCookies } from '~/app/libs/parse-cookies';
import { getBundleId } from '~/app/libs/query-params/getParam/get-bundle-id';
import { getSdk } from '~/app/libs/query-params/getParam/get-sdk';
import { createRestUtilities } from '~/shared/libs/axios/client-side-axios';
import { pickBy } from '~/shared/libs/object-helpers';
import { MagicAPIResponse } from '~/shared/types/magic-api-response';
import { getReferrer } from '../../libs/get-referrer';
import { store } from '../../store';
import { getMagicSdkVersion } from '~/app/libs/get-magic-sdk-version';
import { addTraceIdToWindow } from '~/app/libs/trace-id';

export const authRelayerRestUtilities = createRestUtilities<MagicAPIResponse>({
  requestInterceptor: config => {
    const referrer = getReferrer();
    const { _aucsrf: CSRFToken, _bundleId: bundleIdFromCookies } = parseCookies();
    const { ust, customAuthorizationToken } = store.getState().Auth;
    const apiKey = getApiKey();
    const trace_id = createUuid();
    addTraceIdToWindow(trace_id);
    const bundleId = getBundleId();
    const sdk = getSdk();

    return merge(
      {
        baseURL: window.location.origin,
        withCredentials: true,
        headers: pickBy({
          authorization: ust && `Bearer ${ust}`,
          'x-magic-trace-id': trace_id,
          'x-amzn-trace-id': `Root=${trace_id}`,
          'x-magic-referrer': referrer,
          'x-magic-api-key': apiKey,
          'x-magic-csrf': CSRFToken,
          'x-magic-sdk': sdk,
          'x-magic-sdk-version': getMagicSdkVersion(),
          'x-magic-bundle-id': bundleIdFromCookies || bundleId,
          'accept-language': getLocaleFromParams(),
          'x-custom-authorization-token': customAuthorizationToken,
        }),
      },

      config,
    );
  },

  metadataFactory: config => ({ endpoint: config.url, trace_id: config.headers?.['x-magic-trace-id'] }),

  errorTransform: (err, metadata) => createServiceError(err.response?.data ?? err, { urgency: 'warning', ...metadata }),
});
