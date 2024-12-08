import { Typography, Icon, MonochromeIcons, Spacer, CallToAction } from '@magiclabs/ui';
import React from 'react';
import { useTheme } from '~/app/ui/hooks/use-theme';
import styles from './trial-mode-banner.less';
import { i18n } from '~/app/libs/i18n';
import { AnalyticsActionType, trackAction } from '~/app/libs/analytics';

export const getIsTrialMode = (payloadMethod: string) => {
  // Returning false as there is no need for trial mode currently.
  // Preserving function and dependent UI for future use case.
  return false;
};

export const TrialModeBanner = () => {
  const { theme } = useTheme();
  return (
    <div className={styles.TrialModeBanner}>
      <div className={styles.bannerContent}>
        <Typography.BodySmall
          style={{ textTransform: 'uppercase', fontSize: '12px', lineHeight: '14px', display: 'flex' }}
        >
          <Icon type={MonochromeIcons.Warning} color="#FFF" size={12} />
          &nbsp;<span>{i18n.generic.trial_mode.toString()}</span>
        </Typography.BodySmall>
        <Spacer size={2} orientation="vertical" />
        <Typography.BodySmall style={{ fontWeight: 400, fontSize: '14px', lineHeight: '21px' }}>
          {i18n.generic.trial_mode.toMarkdown({ appName: theme.appName })}
        </Typography.BodySmall>
        <Spacer size={4} orientation="vertical" />
        <CallToAction
          color="secondary"
          size="sm"
          onClick={() => {
            trackAction(AnalyticsActionType.WidgetUiTrialModeBannerUpgradeButtonClicked);
            window.open('https://dashboard.magic.link/login?widget_ui_bundle=true');
          }}
        >
          <span className={styles.btnText}>{i18n.generic.upgrade_now_widget_ui.toString()}</span>
        </CallToAction>
      </div>
    </div>
  );
};
