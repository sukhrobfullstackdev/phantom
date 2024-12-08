import {
  cardIconAssetsSVG,
  currencyAssetsSVG,
  flagsAssetsPNG,
  customThemeLogoAssetsSVG,
  createImageTagProps,
} from '~/app/libs/asset-resolvers';

beforeEach(() => {});
const validAssetUrlInstance = new URL('https://troll-goat.com/goat.png');

test('cardIconAssetsSVG', () => {
  const res = cardIconAssetsSVG('brand');
  expect(res.src === 'https://assets.fortmatic.com/CardIcon/brand.svg').toBe(true);
});

test('currencyAssetsSVG', () => {
  const res = currencyAssetsSVG('type', 'code');
  expect(res.src === 'https://assets.fortmatic.com/typeCurrency/code.svg').toBe(true);
});
test('flagsAssetsPNG', () => {
  const res = flagsAssetsPNG('country');
  expect(res.src === 'https://assets.fortmatic.com/Flags/country.png').toBe(true);
});

test('customThemeLogoAssetsSVG valid asset URL', () => {
  const res = customThemeLogoAssetsSVG(validAssetUrlInstance);
  expect(res.src === 'https://troll-goat.com/goat.png').toBe(true);
});

test('customThemeLogoAssetsSVG asset Name', () => {
  const res = customThemeLogoAssetsSVG('trollgoat');
  expect(res.src === 'https://assets.fortmatic.com/CustomThemeLogo/trollgoat.svg').toBe(true);
});

test('createImageTagProps with invalid source', () => {
  const res = createImageTagProps('Not a URL');
  expect(res.src === 'Not a URL').toBe(true);
});

test('createImageTagProps with valid source', () => {
  const res = createImageTagProps(validAssetUrlInstance);
  expect(res.src === 'https://troll-goat.com/goat.png').toBe(true);
});

test('createImageTagProps with valid fallbackSource and onError', () => {
  const res = createImageTagProps(validAssetUrlInstance, validAssetUrlInstance);
  res.onError?.({ target: { src: 'https://fallback.org' } } as any);
  expect(res.src === 'https://troll-goat.com/goat.png').toBe(true);
});

test('createImageTagProps with invalid fallbackSource', () => {
  const res = createImageTagProps(validAssetUrlInstance, 'Not A Url');
  expect(res.src === 'https://troll-goat.com/goat.png').toBe(true);
});
