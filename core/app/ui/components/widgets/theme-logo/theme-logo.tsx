import React, { forwardRef } from 'react';
import { Icon } from '@magiclabs/ui';
import { customThemeLogoAssetsSVG, magicDefaultLogoUrl } from '../../../../libs/asset-resolvers';
import { useTheme } from '../../../hooks/use-theme';
import { PlaceholderAppLogo } from '~/shared/svg/magic-connect';

export const ThemeLogo = forwardRef<
  HTMLImageElement,
  Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'onError' | 'alt'>
>((props, externalRef) => {
  const { theme } = useTheme();
  const altText = `${theme.appName} Logo`;
  const isPlaceholderLogo = theme.logoImage === magicDefaultLogoUrl.href;
  const legacyProps = customThemeLogoAssetsSVG(theme.logoImage);
  const height = parseInt(props.height as string, 10);
  const width = parseInt(props.width as string, 10);
  return (
    <>
      {isPlaceholderLogo ? (
        <Icon
          size={{ height, width }}
          type={PlaceholderAppLogo}
          style={{ overflow: 'hidden', objectFit: 'contain', maxWidth: '300px', ...props.style }}
        />
      ) : (
        <img
          {...props}
          style={{ overflow: 'hidden', objectFit: 'contain', maxWidth: '300px', ...props.style }}
          {...legacyProps}
          alt={altText}
          ref={externalRef}
        />
      )}
    </>
  );
});

ThemeLogo.displayName = 'ThemeLogo';
