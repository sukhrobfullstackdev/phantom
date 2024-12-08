import React from 'react';
import { Outset, Spacer } from '@magiclabs/ui';
import { defaultTheme } from '~/app/libs/theme';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { ThemeLogo } from '../../../widgets/theme-logo';
import { i18n } from '~/app/libs/i18n';

import styles from './email-otp-preview.less';

export const EmailOtpPreview: React.FC = () => {
  const { theme } = useTheme();
  const showLogo = theme.logoImage !== defaultTheme.logoImage;

  return (
    <Outset all={40} trim="vertical">
      <div className={styles.EmailOtpPreview}>
        {showLogo && <ThemeLogo height={69} />}
        {showLogo && <Spacer size={10} orientation="vertical" />}
        <h1>{theme.appName}</h1>

        <Spacer size={25} orientation="vertical" />
        <p>Login Code</p>
        <Spacer size={25} orientation="vertical" />

        <p style={{ fontSize: '48px' }}>
          <b>860110</b>
        </p>

        <Spacer size={25} orientation="vertical" />

        <p>This code expires in 20 minutes.</p>
        <Spacer size={10} orientation="vertical" />
        <p>
          This login was requested using <b>Chrome, MacOS</b> at <b>08:02:45 PDT</b> on <b>Aug 20, 2023</b>
        </p>

        <Spacer size={25} orientation="vertical" />

        <p>
          <b>{i18n.email_preview.app_team.toString({ appName: theme.appName })}</b>
        </p>
      </div>
    </Outset>
  );
};

EmailOtpPreview.displayName = 'EmailOtpPreview';
