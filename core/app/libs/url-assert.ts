import { MGBOX_API_URL, REVEAL_MAGIC_URL } from '~/server/constants/mobile-mgbox-url';
import { getLogger } from '~/app/libs/datadog';

const WILD_CARD = 'WILDCARD';

export function assertURLWithDomainAllowlist(domainAllowlist: string[], urlToMatch: string): boolean {
  const reasons: [{ allowListDomain: string; reason: string }?] = [];

  try {
    const url = new URL(urlToMatch);
    const { hostname, protocol } = url;

    // Special handling for localhost
    if (hostname === 'localhost' && protocol === 'http:') {
      return true;
    }

    // Handle MGBOX bypass
    if (urlToMatch === MGBOX_API_URL || urlToMatch === REVEAL_MAGIC_URL) return true;

    const res = domainAllowlist.some(allowListDomain => {
      const { allowListDomainUrl, hasReplacedWildcard } = replaceWildcardHack(allowListDomain);

      // Handle protocol mismatching
      if (protocol !== allowListDomainUrl.protocol) {
        reasons.push({ allowListDomain, reason: 'protocol mismatch' });
        return false;
      }

      const allowListDomainHostname = decodeURI(allowListDomainUrl.hostname);
      const toMatchHostname = decodeURI(hostname);

      const domainParts = allowListDomainHostname.split('.').reverse();
      const toMatchParts = toMatchHostname.split('.').reverse();

      // if two domain length is more than 2, they're mismatch
      if (Math.abs(domainParts.length - toMatchParts.length) > 1) {
        reasons.push({ allowListDomain, reason: 'length obviously longer' });
        return false;
      }

      const domainLastIndex = domainParts.length - 1;
      const toMatchLastIndex = toMatchParts.length - 1;
      const longerIndex = domainLastIndex > toMatchLastIndex ? domainLastIndex : toMatchLastIndex;

      // Handle wildcard domains except the last part
      for (let i = 0; i < longerIndex; i++) {
        if (
          ((!hasReplacedWildcard && domainParts[i] !== '*') || (hasReplacedWildcard && domainParts[i] !== WILD_CARD)) &&
          domainParts[i] !== toMatchParts[i]
        ) {
          reasons.push({ allowListDomain, reason: `parts mismatch ${domainParts[i]}, ${toMatchParts[i]}` });
          return false;
        } // Mismatch found
      }

      // Handle matching root domain without www i.e. magic.link => www.magic.link
      // Handle matching root domain with www i.e. www.magic.link => magic.link
      if (
        Math.abs(domainParts.length - toMatchParts.length) === 1 &&
        ((domainParts[domainLastIndex] === 'www' && toMatchParts[domainLastIndex] !== undefined) ||
          (domainParts[toMatchLastIndex] === undefined && toMatchParts[toMatchLastIndex] !== 'www'))
      ) {
        reasons.push({
          allowListDomain,
          reason: `www ${domainParts[domainLastIndex]}, ${toMatchParts[domainLastIndex]}, ${domainParts[toMatchLastIndex]} ,${toMatchParts[toMatchLastIndex]}`,
        });
        return false;
      }

      return true;
    });

    // Log failing reason
    if (!res) {
      getLogger().warn('event Origin allowlist check failed', {
        eventOriginToCheck: urlToMatch,
        domainAllowlist,
        reasons,
      });
    }

    return res;
  } catch (error) {
    // Handle invalid URLs
    getLogger().error('event Origin allowlist check failed unexpected', {
      eventOriginToCheck: urlToMatch,
      domainAllowlist,
      reasons,
      error,
    });
    return false;
  }
}

// This hack is to work around Firefox not supporting Wildcard in the URL
const replaceWildcardHack = (allowListDomain: string) => {
  let hasReplacedWildcard = false;
  let allowListDomainUrl: URL;

  if (!allowListDomain.includes('*.')) {
    allowListDomainUrl = new URL(allowListDomain);
  } else {
    hasReplacedWildcard = true;
    allowListDomainUrl = new URL(allowListDomain.replace('*.', `${WILD_CARD}.`));
  }

  return { allowListDomainUrl, hasReplacedWildcard };
};
