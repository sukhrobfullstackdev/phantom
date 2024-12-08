import { RedirectAllowlistError, checkRedirectAllowlist } from './allowlist';

describe('checkRedirectAllowlist', () => {
  it('should validate a URL that matches exactly ', () => {
    const redirectUrl = 'https://relayer-test-kitcen.vercel.app/redirect';
    const redirectAllowList = ['https://relayer-test-kitcen.vercel.app/redirect'];
    const isRequired = false;

    const expected = { redirectUrlIsValid: true };

    const actual = checkRedirectAllowlist({
      redirectUrl,
      redirectAllowList,
      isRequired,
    });

    expect(actual).toEqual(expected);
  });

  it('should validate a URL that matches a wildcard domain (type A)', () => {
    const redirectUrl = 'https://relayer-test-kitcen.vercel.app/redirect';
    const redirectAllowList = ['https://*.vercel.app/redirect'];
    const isRequired = false;

    const expected = { redirectUrlIsValid: true };

    const actual = checkRedirectAllowlist({
      redirectUrl,
      redirectAllowList,
      isRequired,
    });

    expect(actual).toEqual(expected);
  });

  it('should validate a URL that matches a wildcard subdomain', () => {
    const redirectUrl = 'https://relayer-test-kitcen.vercel.app/redirect';
    const redirectAllowList = ['https://relayer-test-kitcen.*.app/redirect'];
    const isRequired = true;

    const expected = {
      redirectUrlIsValid: true,
    };

    const actual = checkRedirectAllowlist({
      redirectUrl,
      redirectAllowList,
      isRequired,
    });

    expect(actual).toEqual(expected);
  });

  it('should validate a URL that matches a wildcard TLD', () => {
    const redirectUrl = 'https://relayer-test-kitcen.vercel.app/redirect';
    const redirectAllowList = ['https://relayer-test-kitcen.vercel.*/redirect'];
    const isRequired = true;

    const expected = { redirectUrlIsValid: true };

    const actual = checkRedirectAllowlist({
      redirectUrl,
      redirectAllowList,
      isRequired,
    });

    expect(actual).toEqual(expected);
  });

  it('should validate a URL that matches a wildcard path', () => {
    const redirectUrl = 'https://relayer-test-kitcen.vercel.app/redirect';
    const redirectAllowList = ['https://relayer-test-kitcen.vercel.app/*'];
    const isRequired = true;

    const expected = { redirectUrlIsValid: true };

    const actual = checkRedirectAllowlist({
      redirectUrl,
      redirectAllowList,
      isRequired,
    });

    expect(actual).toEqual(expected);
  });

  it('should validate a URL that matches a double wildcard', () => {
    const redirectUrl = 'https://relayer-test-kitcen.vercel.app/redirect';
    const redirectAllowList = ['https://*/*'];
    const isRequired = true;

    const expected = { redirectUrlIsValid: true };

    const actual = checkRedirectAllowlist({
      redirectUrl,
      redirectAllowList,
      isRequired,
    });

    expect(actual).toEqual(expected);
  });

  it('should validate a URL with a trailing slash when the allow list does not have one', () => {
    const redirectUrl = 'https://relayer-test-kitcen.vercel.app/';
    const redirectAllowList = ['https://relayer-test-kitcen.vercel.app'];
    const isRequired = true;

    const expected = { redirectUrlIsValid: true };

    const actual = checkRedirectAllowlist({
      redirectUrl,
      redirectAllowList,
      isRequired,
    });

    expect(actual).toEqual(expected);
  });

  it('should validate a URL without a trailing slash when the allow list has one', () => {
    const redirectUrl = 'https://relayer-test-kitcen.vercel.app';
    const redirectAllowList = ['https://relayer-test-kitcen.vercel.app/'];
    const isRequired = true;

    const expected = { redirectUrlIsValid: true };

    const actual = checkRedirectAllowlist({
      redirectUrl,
      redirectAllowList,
      isRequired,
    });

    expect(actual).toEqual(expected);
  });

  it('should validate that any port on localhost is allowed in the redirect URL when it is required', () => {
    const redirectUrl = 'http://localhost:3014';
    const redirectAllowList = ['http://localhost', 'https://magic-facaster.vercel.app'];
    const isRequired = true;

    const expected = {
      redirectUrlIsValid: true,
    };

    const actual = checkRedirectAllowlist({
      redirectUrl,
      redirectAllowList,
      isRequired,
    });

    expect(actual).toEqual(expected);
  });

  it('should return RedirectAllowlistError.MISMATCH for a mismatched URL', () => {
    const redirectUrl = 'https://relayer-test-kitcen.vercel.app/redirect';
    const redirectAllowList = ['https://relayer-test-hello-kitcen.vercel.app/redirect'];
    const isRequired = true;

    const expected = {
      redirectUrlIsValid: false,
      redirectUrlError: RedirectAllowlistError.MISMATCH,
    };

    const actual = checkRedirectAllowlist({
      redirectUrl,
      redirectAllowList,
      isRequired,
    });

    expect(actual).toEqual(expected);
  });

  it('should return RedirectAllowlistError.EMPTY for an empty allowlist', () => {
    const redirectUrl = 'https://relayer-test-kitcen.vercel.app/redirect';
    const redirectAllowList = [];
    const isRequired = true;

    const expected = {
      redirectUrlIsValid: false,
      redirectUrlError: RedirectAllowlistError.EMPTY,
    };

    const actual = checkRedirectAllowlist({
      redirectUrl,
      redirectAllowList,
      isRequired,
    });

    expect(actual).toEqual(expected);
  });
});
