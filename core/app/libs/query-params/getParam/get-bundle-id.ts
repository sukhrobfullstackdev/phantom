import { Endpoint } from '~/server/routes/endpoint';
import { getOptionsFromEndpoint } from '~/app/libs/query-params';
import { currentEndpoint } from '~/app/libs/match-endpoint';

/**
 * Return the developer API key, parsed from the correct source depending on the
 * current location/user flow.
 */
export function getBundleId() {
  const route = currentEndpoint();

  switch (route) {
    case Endpoint.Client.SendLegacy:
    case Endpoint.Client.SendV1: {
      return getOptionsFromEndpoint(Endpoint.Client.SendLegacy).bundleId || 'BundleIDMissing';
    }

    // For backward compatibility
    default: {
      return 'BundleIDMissing';
    }
  }
}
