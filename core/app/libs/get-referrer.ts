import { isEmpty } from '~/app/libs/lodash-utils';
import { Endpoint } from '~/server/routes/endpoint';
import { isValidURL } from '~/shared/libs/validators';
import { getOptionsFromEndpoint } from './query-params';
import { getFirstReferrer, isFCL } from './fcl/is-fcl';

/**
 * Gets the referrer domain from `document.referrer`, with fallbacks.
 */
export function getReferrer(): string {
  const fallback = 'https://no-referrer.magic.link';

  if (isFCL()) {
    return getFirstReferrer() ?? fallback;
  }

  const options = getOptionsFromEndpoint(Endpoint.Client.SendLegacy);
  const optionsConfirm = getOptionsFromEndpoint(Endpoint.Client.ConfirmV1);
  const optionsLogin = getOptionsFromEndpoint(Endpoint.Client.LoginV1);

  /*

    We preprocess the referrer here because sometimes dApps set the
    referrer-policy to no-referrer. This blocks the referrer header.
    `windows.referrer` and `document.referrer` will be undefined. (See
    Fortmatic#1782 for more context).

    ADDENDUM: Now pass DOMAIN_ORIGIN from SDK, which we will use as fallback option
    ADDENDUM: Use window.location.ancestorOrigins as default, (See X#1487)

   */

  const referrerOrigin = document?.referrer ? new URL(document.referrer).origin : '';
  let originDomain: string | undefined = window.location?.ancestorOrigins?.[0] || referrerOrigin;

  const magicRegex = /auth.*\.magic\.link$/;
  const search = magicRegex;

  if (search.test(originDomain) || isEmpty(originDomain)) {
    originDomain = options.DOMAIN_ORIGIN || optionsConfirm.redirect_url || optionsLogin.redirect_url;
  }

  // Normalize the referrer domain before usage
  return isValidURL(originDomain) ? new URL(originDomain!).origin : fallback;
}
