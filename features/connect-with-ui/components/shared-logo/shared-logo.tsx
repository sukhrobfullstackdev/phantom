import { Icon } from '@magiclabs/ui';
import React from 'react';
import { ThemeLogo } from '~/app/ui/components/widgets/theme-logo';
import { MagicGradientIcon } from '~/shared/svg/magic-connect';
import { OverlapIcons } from '../overlap-icons';

export const SharedLogo = () => (
  <OverlapIcons
    left={
      <ThemeLogo
        height="56px"
        width="56px"
        style={{
          borderRadius: '50%',
        }}
      />
    }
    right={<Icon type={MagicGradientIcon} size={56} />}
  />
);
