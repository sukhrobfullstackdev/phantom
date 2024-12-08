import { getOptionsFromEndpoint } from './query-params';
import { Endpoint } from '~/server/routes/endpoint';

export function getMagicSdkVersion() {
  return getOptionsFromEndpoint(Endpoint.Client.SendLegacy).version;
}
