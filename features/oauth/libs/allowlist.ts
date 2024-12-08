export type CheckRedirectAllowlistParams = {
  redirectAllowList?: string[];
  redirectUrl: string;
  isRequired?: boolean;
};

export enum RedirectAllowlistError {
  MISMATCH,
  EMPTY,
}

const defaultRedirectAllowlist = ['https://reveal.magic.link'];

const normalizeUrl = (url: string): string => {
  try {
    const normalizedUrl = new URL(url);
    return normalizedUrl.origin + (normalizedUrl.pathname === '/' ? '' : normalizedUrl.origin + normalizedUrl.pathname);
  } catch (error) {
    return '';
  }
};

const createPatternFromWildcard = (pattern: string): RegExp => {
  if (pattern === 'http://localhost') {
    // Allow any port number for localhost
    return new RegExp('^http://localhost(:[0-9]+)?$');
  }

  const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regexPattern = escapedPattern.replace(/\\\*/g, '.*');
  return new RegExp(`^${regexPattern}$`);
};

export const checkRedirectAllowlist = ({
  redirectUrl,
  redirectAllowList = [],
  isRequired = false,
}: CheckRedirectAllowlistParams): {
  redirectUrlIsValid: boolean;
  redirectUrlError?: RedirectAllowlistError | null;
} => {
  if (!isRequired && !redirectAllowList?.length) {
    return { redirectUrlIsValid: true };
  }

  if (defaultRedirectAllowlist.includes(new URL(redirectUrl).origin)) {
    return {
      redirectUrlIsValid: true,
    };
  }

  if (isRequired && redirectAllowList.length === 0) {
    return {
      redirectUrlIsValid: false,
      redirectUrlError: RedirectAllowlistError.EMPTY,
    };
  }

  const normalizedRedorectUrl = normalizeUrl(redirectUrl);

  const isValid = redirectAllowList.some(url => {
    const normalizedUrl = normalizeUrl(url);
    const urlPattern = createPatternFromWildcard(normalizedUrl);
    return urlPattern.test(normalizedRedorectUrl);
  });

  if (!isValid) {
    return {
      redirectUrlIsValid: false,
      redirectUrlError: RedirectAllowlistError.MISMATCH,
    };
  }

  return { redirectUrlIsValid: true };
};
