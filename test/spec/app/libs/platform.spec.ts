import { isMobileSDK } from '~/app/libs/platform';
import { stubGetOptionsFromEndpoint } from '../../_utils/stubs';

test('box.magic.link shall match true', () => {
  stubGetOptionsFromEndpoint({ DOMAIN_ORIGIN: 'http://box.magic.link' });

  expect(isMobileSDK()).toBe(true);
});

test('box.dev.magic.link shall return true', () => {
  stubGetOptionsFromEndpoint({ DOMAIN_ORIGIN: 'http://box.dev.magic.link' });

  expect(isMobileSDK()).toBe(true);
});

test('box.stagef.magic.link shall return true', () => {
  stubGetOptionsFromEndpoint({ DOMAIN_ORIGIN: 'http://box.stagef.magic.link' });

  expect(isMobileSDK()).toBe(true);
});

test('Empty string shall return false', () => {
  stubGetOptionsFromEndpoint({ DOMAIN_ORIGIN: '' });

  expect(isMobileSDK()).toBe(false);
});

test('magic ios sdk string shall return true', () => {
  stubGetOptionsFromEndpoint({ sdk: 'magic-sdk-ios' });

  expect(isMobileSDK()).toBe(true);
});

test('magic android sdk shall return true', () => {
  stubGetOptionsFromEndpoint({ sdk: 'magic-sdk-android' });

  expect(isMobileSDK()).toBe(true);
});

test('magic react native sdk return true', () => {
  stubGetOptionsFromEndpoint({ sdk: '@magic-sdk/react-native' });

  expect(isMobileSDK()).toBe(true);
});

test('magic flutter sdk shall return true', () => {
  stubGetOptionsFromEndpoint({ sdk: 'magic-sdk-flutter' });

  expect(isMobileSDK()).toBe(true);
});
