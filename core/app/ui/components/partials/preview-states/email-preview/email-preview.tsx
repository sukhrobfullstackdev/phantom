import React from 'react';
import { CallToAction, Outset, Spacer } from '@magiclabs/ui';
import { defaultTheme } from '../../../../../libs/theme';
import { useTheme } from '../../../../hooks/use-theme';
import { ThemeLogo } from '../../../widgets/theme-logo';
import { i18n } from '~/app/libs/i18n';

import styles from './email-preview.less';

export const EmailPreview: React.FC = () => {
  const { theme } = useTheme();
  const showLogo = theme.logoImage !== defaultTheme.logoImage;

  return (
    <Outset all={40} trim="vertical">
      <div className={styles.EmailPreview}>
        {showLogo && <ThemeLogo height={69} />}
        {showLogo && <Spacer size={10} orientation="vertical" />}
        <h1>{theme.appName}</h1>

        <Spacer size={25} orientation="vertical" />
        <p>
          {i18n.email_preview.click_button_below_to_app.toMarkdown({ appName: theme.appName })}
          <br />
          {i18n.email_preview.button_will_expire_in.toMarkdown()}
        </p>
        <Spacer size={25} orientation="vertical" />

        {/*
          The email preview has a less-pronounced border-radius (as opposed to
          the pill-shape elsewhere in our design system). Here, we are aligning
          the preview rendering with our current email template by overriding
          the border-radius.
         */}
        <CallToAction style={{ display: 'inline', borderRadius: '6px' }}>
          {i18n.email_preview.login_to_app.toMarkdown({ appName: theme.appName })}
        </CallToAction>

        <Spacer size={25} orientation="vertical" />

        <p>{i18n.email_preview.confirming_this_request_will.toMarkdown()}</p>
        <Spacer size={10} orientation="vertical" />
        <p>{i18n.email_preview.if_you_did_not_make_this_request.toMarkdown()}</p>

        <Spacer size={25} orientation="vertical" />

        <p>
          <b>{i18n.email_preview.app_team.toString({ appName: theme.appName })}</b>
        </p>
      </div>
    </Outset>
  );
};

EmailPreview.displayName = 'EmailPreview';
