import browserEnv from '@ikscodes/browser-env';
import { getLocaleFromParams, T } from '~/app/libs/i18n';
import { encodeBase64 } from '~/app/libs/base64';

test('getLocaleFromParams send en_us', () => {
  let locale = '';
  browserEnv.stub('window.location', {
    search: `?params=${encodeBase64(JSON.stringify({ locale: 'en_us' }))}`,
    pathname: '/send',
  });
  locale = getLocaleFromParams();
  expect(locale === 'en_us').toBe(true);
});

test('getLocaleFromParams preview en_us', () => {
  browserEnv.stub('window.location', {
    search: `?params=${encodeBase64(JSON.stringify({ locale: 'en_us' }))}`,
    pathname: '/preview/1',
  });
  const locale = getLocaleFromParams();
  expect(locale === 'en_us').toBe(true);
});

test('getLocaleFromParams confirm-email en_us', () => {
  browserEnv.stub('window.location', {
    search: '?locale=en_us',
    pathname: '/confirm-email/type',
  });
  const locale = getLocaleFromParams();
  expect(locale === 'en_us').toBe(true);
});

test('getLocaleFromParams confirm en_us', () => {
  browserEnv.stub('window.location', {
    search: '?locale=en_us',
    pathname: '/confirm',
  });
  const locale = getLocaleFromParams();
  expect(locale === 'en_us').toBe(true);
});

test('getLocaleFromParams error page (not case) en_us', () => {
  browserEnv.stub('window.location', {
    search: '?locale=en_us',
    pathname: '/error',
  });
  const locale = getLocaleFromParams();
  expect(locale === 'en_us').toBe(true);
});

test('T constructor toString default', () => {
  const myTranslation = new T('check_your_email', 'login');
  const str = myTranslation.toString();
  expect(str === 'Check your email').toBe(true);
});

test('T constructor toString with replacements', () => {
  const myTranslation = new T<'appName'>('click_button_below_to_app', 'email_preview');
  const str = myTranslation.toString({ appName: 'my app' });
  expect(str === 'Click the button below to log in to my app.').toBe(true);
});

test('T constructor no translation found', () => {
  browserEnv.stub('window.location', {
    search: '?locale=pl_pl',
    pathname: '/confirm-email/type',
  });
  const myTranslation = new T('not_found', 'not_found');
  const str = myTranslation.toString();
  expect(str === '').toBe(true);
});
