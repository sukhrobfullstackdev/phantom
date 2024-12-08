import browserEnv from '@ikscodes/browser-env';
import { isEmpty } from '~/app/libs/lodash-utils';
import { parseCookies } from '~/app/libs/parse-cookies';

test('parseCookies no cookies', () => {
  browserEnv.stub('document.cookie', undefined);
  const cookies = parseCookies();
  expect(isEmpty(cookies)).toBe(true);
});

test('parseCookies valid JSON cookie', () => {
  browserEnv.stub('document.cookie', `cookie1=${encodeURIComponent(`j:${JSON.stringify({ aaa: 'bbb' })}`)}`);
  const cookies = parseCookies();
  expect(cookies.cookie1).toEqual({ aaa: 'bbb' });
});

test('parseCookies valid non-JSON cookie', () => {
  browserEnv.stub('document.cookie', `cookie1=hello`);
  const cookies = parseCookies();
  expect(cookies.cookie1).toBe('hello');
});
