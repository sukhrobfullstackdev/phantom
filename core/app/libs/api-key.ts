import { getOptionsFromEndpoint } from './query-params';
import { currentEndpoint } from './match-endpoint';
import { Endpoint } from '~/server/routes/endpoint';
import { parseApiKeyFromPage } from './load-feature';
import { decodeBase64 } from './base64';

/**
 * Return the developer API key, parsed from the correct source depending on the
 * current location/user flow.
 */
export function getApiKey() {
  const route = currentEndpoint();

  switch (route) {
    case Endpoint.Client.ConfirmV1: {
      return getOptionsFromEndpoint(Endpoint.Client.ConfirmV1).ak;
    }

    case Endpoint.Client.LoginV1: {
      return getOptionsFromEndpoint(Endpoint.Client.LoginV1).ak;
    }

    case Endpoint.Client.NewDeviceV1: {
      return getOptionsFromEndpoint(Endpoint.Client.NewDeviceV1).ak;
    }

    case Endpoint.Client.SendLegacy:
    case Endpoint.Client.SendV1: {
      return getOptionsFromEndpoint(Endpoint.Client.SendLegacy).API_KEY;
    }

    case Endpoint.Client.ConfirmNFTTransferV1: {
      return getOptionsFromEndpoint(Endpoint.Client.ConfirmNFTTransferV1).ak;
    }

    case Endpoint.Client.ConfirmAction: {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('ak') as string) {
        return urlParams.get('ak');
      }
      const tct = urlParams.get('tct') as string;
      if (tct) {
        const parts = tct.split('.');
        const tctPayload = JSON.parse(decodeBase64(parts[1]));
        return tctPayload.api_key;
      }
      return '';
    }

    default: {
      return parseApiKeyFromPage();
    }
  }
}
