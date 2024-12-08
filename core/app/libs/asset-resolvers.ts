// These utilities are based on the file structure in:
// https://github.com/fortmatic/assets/tree/master/assets

import { isValidURL } from '~/shared/libs/validators';
import { getLogger } from '~/app/libs/datadog';

export const assetsUrl = new URL('https://assets.fortmatic.com');
export const magicDefaultLogoUrl = new URL('/MagicLogos/blank.png', assetsUrl);

export function cardIconAssetsSVG(brand: string) {
  return createImageTagProps(new URL(`/CardIcon/${brand}.svg`, assetsUrl));
}

export function currencyAssetsSVG(type: string, code: string) {
  return createImageTagProps(new URL(`/${type}Currency/${code}.svg`, assetsUrl));
}

export function flagsAssetsPNG(countryCode: string) {
  return createImageTagProps(new URL(`/Flags/${countryCode}.png`, assetsUrl));
}

export function customThemeLogoAssetsSVG(assetNameOrURL: string | URL) {
  const source = isValidURL(assetNameOrURL)
    ? assetNameOrURL
    : new URL(`/CustomThemeLogo/${assetNameOrURL}.svg`, assetsUrl);

  /* istanbul ignore next */
  const fallbackSource = magicDefaultLogoUrl;

  return createImageTagProps(source, fallbackSource);
}

export function createImageTagProps(
  source: string | URL,
  fallbackSource?: string | URL,
): Pick<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'onError'> {
  const sourceHref = source instanceof URL ? source.href : source;
  const fallbackHref = fallbackSource instanceof URL ? fallbackSource.href : fallbackSource;

  return {
    src: sourceHref,
    onError: (event: any) => {
      getLogger().warn('Assets image missing. Please check metadata for details', { url: source });
      /* eslint-disable-next-line no-param-reassign */
      if (!!fallbackHref && event?.target?.src) event.target.src = fallbackHref;
    },
  };
}
