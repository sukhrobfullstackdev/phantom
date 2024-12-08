/*
  eslint-disable
  jsx-a11y/anchor-is-valid,
  jsx-a11y/click-events-have-key-events,
  jsx-a11y/no-static-element-interactions
 */

import React, { useEffect } from 'react';
import { Flex, Icon, Spacer } from '@magiclabs/ui';
import { useSelector } from '../../../../../hooks/redux-hooks';
import { trackAction, AnalyticsActionType } from '~/app/libs/analytics';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { i18n } from '~/app/libs/i18n';
import { SuccessCheckmark } from '~/shared/svg/magic-connect';

export const RedirectLoginComplete: React.FC = () => {
  const userEmail = useSelector(state => state.Auth.userEmail);

  useEffect(() => {
    trackAction(AnalyticsActionType.PendingModalUpdated, { email: userEmail, status: 'success' });
  }, [userEmail]);

  const { theme } = useTheme();

  return (
    <Flex.Column horizontal="center">
      <Icon type={SuccessCheckmark} size={40} color={theme.hex.primary.base} />
      <Spacer size={24} orientation="vertical" />
      <h2>{i18n.login.redirect_login_complete_header.toMarkdown()}</h2>
      <Spacer size={8} orientation="vertical" />
      <div className="fontDescriptionSmall fontCentered">{i18n.login.redirect_login_complete_content.toMarkdown()}</div>
    </Flex.Column>
  );
};
