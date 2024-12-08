import { currentEndpoint } from './match-endpoint';
import { DEFAULT_THEME } from '@magiclabs/ui';
import { Theme, CustomBrandingType } from '~/shared/types/theme';
import { Endpoint } from '~/server/routes/endpoint';
import { getOptionsFromEndpoint } from './query-params';
import { parseThemeFromPage } from './load-feature';
import { isEqual } from '~/app/libs/lodash-utils';

import {
  CUSTOM_BRANDING_TYPE_VALUES,
  THEME_BRANDING_DEFAULT_VALUE,
  THEME_BRANDING_HIDE_MAGIC_LOGO,
} from '~/app/constants/theme';
import { magicDefaultLogoUrl } from './asset-resolvers';

export const defaultTheme: Theme = {
  ...DEFAULT_THEME,
  logoImage: magicDefaultLogoUrl.href,
  appName: 'Magic',
  isPreview: false,
  customBrandingType: THEME_BRANDING_DEFAULT_VALUE,
};

/**
 * Returns `true` if the given `theme` is deeply equal to the default theme. If
 * `key` is provided, only that key on the theme is checked for deep equality.
 */
export function isDefaultTheme(theme: Theme, key?: keyof Theme) {
  if (key) return isEqual(theme[key], defaultTheme[key]);
  return isEqual(theme, defaultTheme);
}

export function getCustomBrandingTypeValue(type: CustomBrandingType) {
  return CUSTOM_BRANDING_TYPE_VALUES[type];
}

export function shouldShowMagicLogo(type: CustomBrandingType) {
  return getCustomBrandingTypeValue(type) !== THEME_BRANDING_HIDE_MAGIC_LOGO;
}

export function getRawThemeConfigs() {
  const route = currentEndpoint();

  switch (route) {
    case Endpoint.Client.ConfirmEmailV1:
    case Endpoint.Client.ConfirmV1:
    case Endpoint.Client.LoginV1:
    case Endpoint.Client.NewDeviceV1:
      return getOptionsFromEndpoint(route).ct;

    default:
      return parseThemeFromPage();
  }
}

export * from '~/shared/types/theme';
