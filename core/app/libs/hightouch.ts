import { HtEventsBrowser } from '@ht-sdks/events-sdk-js-browser';
import { HIGHTOUCH_API_KEY, HIGHTOUCH_API_HOST } from '~/shared/constants/env';

export const htevents = HtEventsBrowser.load({ writeKey: HIGHTOUCH_API_KEY }, { apiHost: HIGHTOUCH_API_HOST });
