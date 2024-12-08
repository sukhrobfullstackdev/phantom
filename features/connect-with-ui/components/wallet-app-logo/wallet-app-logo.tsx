import { Icon } from '@magiclabs/ui';
import React from 'react';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { PlaceholderAppLogo } from '~/shared/svg/magic-connect';
import styles from './wallet-app-logo.less';

export const blankLogoUrl = 'https://assets.fortmatic.com/MagicLogos/blank.png';

interface WalletAppLogoProps {
  authWalletTheme: string | null;
  authAppAssetUri: string | undefined;
  appName: string;
  size: number;
}

export const WalletAppLogo = ({ authWalletTheme, authAppAssetUri, appName, size }: WalletAppLogoProps) => {
  const { theme } = useTheme();
  const isConnectAppLightTheme = theme.isLightTheme;
  const isAuthAppLightTheme = authWalletTheme === ('light' || null);
  const shouldRenderPlaceholderLogo = !authAppAssetUri || authAppAssetUri === blankLogoUrl;
  const shouldRenderMatchingThemeAuthApp =
    !shouldRenderPlaceholderLogo && isConnectAppLightTheme === isAuthAppLightTheme;
  const shouldRenderMisMatchingThemeAuthApp =
    !shouldRenderPlaceholderLogo && isConnectAppLightTheme !== isAuthAppLightTheme;

  return (
    <>
      {shouldRenderPlaceholderLogo && <Icon type={PlaceholderAppLogo} size={size} />}
      {shouldRenderMatchingThemeAuthApp && (
        <img
          src={authAppAssetUri}
          height={`${size}px`}
          width={`${size}px`}
          alt={`${appName} logo`}
          style={{ borderRadius: '50px' }}
        />
      )}
      {shouldRenderMisMatchingThemeAuthApp && theme.isLightTheme && (
        <div className={styles.darkBackground} style={{ height: `${size}px`, width: `${size}px` }}>
          <img
            style={{ borderRadius: '50px' }}
            src={authAppAssetUri}
            height={`${size - 4}px`}
            width={`${size - 4}px`}
            alt={`${appName} logo`}
          />
        </div>
      )}
      {shouldRenderMisMatchingThemeAuthApp && theme.isDarkTheme && (
        <div className={styles.lightBackground} style={{ height: `${size}px`, width: `${size}px` }}>
          <img
            style={{ borderRadius: '50px' }}
            src={authAppAssetUri}
            height={`${size - 4}px`}
            width={`${size - 4}px`}
            alt={`${appName} logo`}
          />
        </div>
      )}
    </>
  );
};
