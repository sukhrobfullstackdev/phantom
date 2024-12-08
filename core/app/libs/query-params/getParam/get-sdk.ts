import { Endpoint } from '~/server/routes/endpoint';
import { getOptionsFromEndpoint } from '~/app/libs/query-params';
import { currentEndpoint } from '~/app/libs/match-endpoint';

/**
 * Return the SDK type, parsed from the correct source depending on the
 * current location/user flow.
 */
export function getSdk() {
  const route = currentEndpoint();

  switch (route) {
    case Endpoint.Client.SendLegacy:
    case Endpoint.Client.SendV1: {
      return getOptionsFromEndpoint(Endpoint.Client.SendLegacy).sdk || 'SdkMissing';
    }

    // For backward compatibility
    default: {
      return 'SdkMissing';
    }
  }
}
