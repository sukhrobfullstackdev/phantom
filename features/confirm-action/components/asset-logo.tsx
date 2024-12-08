import React from 'react';
import { Flex, Icon, Spacer } from '@magiclabs/ui';
import { blankLogoUrl } from '~/features/connect-with-ui/components/wallet-app-logo';
import { PlaceholderAppLogo } from '~/shared/svg/magic-connect';

export const AssetLogo = ({ assetUri }) => {
  return (
    <Flex.Column horizontal="center">
      {!assetUri || assetUri === blankLogoUrl ? (
        <Icon
          size={{ height: 48, width: 48 }}
          type={PlaceholderAppLogo}
          style={{ overflow: 'hidden', objectFit: 'contain' }}
        />
      ) : (
        <img
          style={{ height: '48px', width: '48px', overflow: 'hidden', objectFit: 'contain' }}
          alt="logo"
          src={assetUri}
        />
      )}

      <Spacer size={12} orientation="vertical" />
    </Flex.Column>
  );
};
