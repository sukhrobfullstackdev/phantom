import type { Theme as BaseTheme, ThemeType } from '@magiclabs/ui';

import { THEME_BRANDING_DEFAULT_VALUE, THEME_BRANDING_HIDE_MAGIC_LOGO_VALUE } from '~/app/constants/theme';

export { ThemeType };

/**
 * This is the client-side theme type, overloaded with a few Auth
 * Relayer-specific fields.
 */
export interface Theme extends BaseTheme {
  logoImage: string;
  appName: string;
  isPreview: boolean;
  customBrandingType: CustomBrandingType;
}

/**
 * This is the interface Magic API uses to represent custom themes.
 */
export interface RawThemeConfig {
  button_color: string | null; // Primary theme color
  asset_uri: string | null; // Location of the logo asset
  app_name: string | null; // The application's display name
  theme_color: ThemeType | null; // Theme type (dark, light, or auto)
  custom_branding_type: CustomBrandingType | null; // Indicates type of custom theme for different customers
  show_secured_by_magic: boolean | null;
}

export type CustomBrandingType = typeof THEME_BRANDING_DEFAULT_VALUE | typeof THEME_BRANDING_HIDE_MAGIC_LOGO_VALUE;
