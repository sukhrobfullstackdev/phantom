import { ClientCookies } from '~/shared/constants/cookies';
import { memoize } from '~/app/libs/lodash-utils';

/**
 * Parses client-side cookies from `document.cookie` and returns a dictionary of
 * cookie names mapped to values.
 */
export const parseCookies = memoize(
  (): ClientCookies => {
    if (document.cookie) {
      return Object.fromEntries<any>(
        document.cookie.split(/; */).map(c => {
          const [key, ...v] = c.split('=');
          const decodedValue = decodeURIComponent(v.join('='));

          // Attempt to parse the value as JSON if appropriate
          let parsedJSON: any;
          try {
            if (decodedValue.startsWith('j:')) parsedJSON = JSON.parse(decodedValue.slice(2));
          } catch {
            parsedJSON = decodedValue;
          }

          return [key, parsedJSON ?? decodedValue];
        }),
      );
    }

    return {};
  },

  // Memoize based on the raw value of `document.cookie`
  () => document.cookie,
);
