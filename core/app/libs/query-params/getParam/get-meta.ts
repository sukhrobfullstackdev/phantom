import { Endpoint } from '~/server/routes/endpoint';
import { getOptionsFromEndpoint } from '~/app/libs/query-params';
import { currentEndpoint } from '~/app/libs/match-endpoint';

/**
 * Return the meta options, base64 encoded
 */
export function getMeta() {
  const route = currentEndpoint();

  switch (route) {
    case Endpoint.Client.SendLegacy:
    case Endpoint.Client.SendV1: {
      const meta = getOptionsFromEndpoint(Endpoint.Client.SendLegacy).meta;
      // Base64 encode the meta object
      return meta ? btoa(JSON.stringify(meta)) : 'None';
    }

    // For backward compatibility
    default: {
      return 'None';
    }
  }
}
