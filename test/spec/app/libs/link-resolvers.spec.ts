import {
  createAnchorTagProps,
  createGmailQueryLink,
  outlookLink,
  magicLandingPageLink,
} from '~/app/libs/link-resolvers';

beforeEach(() => {});

test('createAnchorTagProps string', () => {
  const link = createAnchorTagProps('https://trollgoat.org');
  expect(link.href === 'https://trollgoat.org/').toBe(true);
  expect(link.target === '_blank').toBe(true);
  expect(link.rel === 'noopener noreferrer').toBe(true);
});

test('createAnchorTagProps URL', () => {
  const link = createAnchorTagProps(new URL('https://trollgoat.org'));
  expect(link.href === 'https://trollgoat.org/').toBe(true);
  expect(link.target === '_blank').toBe(true);
  expect(link.rel === 'noopener noreferrer').toBe(true);
});

test('createGmailQueryLink', () => {
  const gmailLink = createGmailQueryLink();
  expect(gmailLink.href === 'https://mail.google.com/mail/u/0/#search/from%3A%40trymagic+in%3Aanywhere').toBe(true);
  expect(gmailLink.target === '_blank').toBe(true);
  expect(gmailLink.rel === 'noopener noreferrer').toBe(true);
});

test('outlookLink', () => {
  expect(outlookLink.href === 'https://outlook.live.com/mail/0/inbox').toBe(true);
  expect(outlookLink.target === '_blank').toBe(true);
  expect(outlookLink.rel === 'noopener noreferrer').toBe(true);
});

test('magicLandingPageLink', () => {
  expect(magicLandingPageLink.href === 'https://magic.link/').toBe(true);
  expect(magicLandingPageLink.target === '_blank').toBe(true);
  expect(magicLandingPageLink.rel === 'noopener noreferrer').toBe(true);
});
