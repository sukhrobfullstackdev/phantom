import React, { useEffect } from 'react';
import { Flex, Icon, Spacer } from '@magiclabs/ui';
import { trackAction, AnalyticsActionType } from '~/app/libs/analytics';
import { i18n } from '~/app/libs/i18n';
import { TrafficCone } from '~/shared/svg/auth';
import styles from './auth-failed.less';

export const AuthFailed: React.FC = () => {
  useEffect(() => {
    trackAction(AnalyticsActionType.ConfirmPageShown, { status: 'failed' });
  }, []);

  return (
    <Flex.Column horizontal="center" aria-live="assertive" className={styles.AuthFailed}>
      <Icon type={TrafficCone} />
      <Spacer size={24} orientation="vertical" />
      <h1 className="fontCentered">{i18n.login.hold_tight_fixing_issue.toMarkdown()}</h1>
      <Spacer size={8} orientation="vertical" />
      <p className="fontDescription fontDescriptionSmall fontCentered">
        {i18n.login.currently_working_on_getting_back_to_normal.toMarkdown()}
      </p>
      <Spacer size={8} orientation="vertical" />
      <p className="fontDescriptionSmall fontCentered">{i18n.login.you_can_close_this_window.toMarkdown()}</p>
    </Flex.Column>
  );
};

AuthFailed.displayName = 'AuthFailed';
