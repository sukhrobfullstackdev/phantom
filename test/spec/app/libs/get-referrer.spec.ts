import browserEnv from '@ikscodes/browser-env';
import * as Env from '~/shared/constants/env';
import { getReferrer } from '~/app/libs/get-referrer';
import { mockEnv, stubGetOptionsFromEndpoint } from '../../_utils/stubs';

/* Mock ENV */
const mockMagicTrue = {
  ...Env,
  IS_MAGIC: true,
  DATADOG_CLIENT_KEY: '',
};

beforeEach(() => {
  browserEnv.restore();
  jest.resetModules();
});

/**
 * Empty options
 */
test('Empty options fallback', () => {
  const referrer = getReferrer();

  expect(referrer).toEqual('https://no-referrer.magic.link');
});

test('Empty options fallback in Magic', () => {
  const mockGetReferrer = mockEnv('~/app/libs/get-referrer', mockMagicTrue);

  const referrer = mockGetReferrer.getReferrer();

  expect(referrer).toEqual('https://no-referrer.magic.link');
});

/**
 * Get referrer from ancestorOrigins
 */
test('get ancestor origin when exists', () => {
  browserEnv.stub('window.location', {
    search: '',
    ancestorOrigins: ['https://test.foo.com'],
  });

  const referrer = getReferrer();

  expect(referrer).toEqual('https://test.foo.com');
});

test('get referrer from document.referrer when ancestor origin not existed', () => {
  browserEnv.stub('window.location', {
    search: '',
    ancestorOrigins: undefined,
  });
  browserEnv.stub('document', {
    referrer: 'https://test.referrer.com',
  });

  const referrer = getReferrer();

  expect(referrer).toEqual('https://test.referrer.com');
});

test('when origin does not end with top level magic domain fallback is used', () => {
  stubGetOptionsFromEndpoint({ DOMAIN_ORIGIN: 'https://domain.hacked.true' });
  const mockGetReferrer = mockEnv('~/app/libs/get-referrer', mockMagicTrue);
  browserEnv.stub('document', {
    referrer: 'https://auth.magic.link.i.is.hacker',
  });
  const referrer = mockGetReferrer.getReferrer();

  expect(referrer).not.toEqual('https://domain.hacked.true');
});

/**
 * Get referrer from options
 */
test(' use DOMAIN_ORIGIN with invalid URL', () => {
  stubGetOptionsFromEndpoint({ DOMAIN_ORIGIN: 'test.referrer.com' });

  const mockGetReferrer = mockEnv('~/app/libs/get-referrer', mockMagicTrue);

  browserEnv.stub('window.location', {
    search: '',
    ancestorOrigins: ['https://auth.magic.link'],
  });

  const referrer = mockGetReferrer.getReferrer();

  expect(referrer).toEqual('https://no-referrer.magic.link');
});

test(' use DOMAIN_ORIGIN in auth.magic.link', () => {
  stubGetOptionsFromEndpoint({ DOMAIN_ORIGIN: 'http://test.referrer.com' });

  const mockGetReferrer = mockEnv('~/app/libs/get-referrer', mockMagicTrue);

  browserEnv.stub('document', null);
  browserEnv.stub('window', {
    location: null,
  });

  const referrer = mockGetReferrer.getReferrer();

  expect(referrer).toEqual('http://test.referrer.com');
});
