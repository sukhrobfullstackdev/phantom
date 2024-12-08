/*
  eslint-disable

  jsx-a11y/anchor-is-valid,
  jsx-a11y/click-events-have-key-events,
  jsx-a11y/no-static-element-interactions
 */

import React, { useEffect } from 'react';
import { Flex, Linkable, Icon, Spacer, CallToAction } from '@magiclabs/ui';
import { useSelector } from '../../../../../hooks/redux-hooks';
import { useCloseUIThread, useEmitUIThreadEvent } from '~/app/ui/hooks/ui-thread-hooks';
import { sdkErrorFactories } from '~/app/libs/exceptions';
import { trackAction, AnalyticsActionType } from '~/app/libs/analytics';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { i18n } from '~/app/libs/i18n';
import { AlertIcon } from '~/shared/svg/auth';

export const MagicLinkExpired: React.FC = () => {
  const userEmail = useSelector(state => state.Auth.userEmail);
  const retry = useEmitUIThreadEvent('retry');
  const close = useCloseUIThread(sdkErrorFactories.client.userDeniedAccountAccess());

  useEffect(() => {
    trackAction(AnalyticsActionType.PendingModalUpdated, { email: userEmail, status: 'expired' });
  }, [userEmail]);

  const { theme } = useTheme();

  return (
    <Flex.Column horizontal="center">
      <Icon type={AlertIcon} size={40} color={theme.hex.primary.base} />

      <Spacer size={24} orientation="vertical" />

      <h2>{i18n.login.magic_link_expired.toMarkdown()}</h2>

      <Spacer size={8} orientation="vertical" />

      <div className="fontDescriptionSmall fontCentered">
        {i18n.login.send_another_magic_link_to_email.toMarkdown({ userEmail })}
      </div>

      <Spacer size={40} orientation="vertical" />

      <CallToAction onPress={retry}>{i18n.login.resend_email.toString()}</CallToAction>

      <Spacer size={16} orientation="vertical" />

      <Linkable>
        <button onClick={close}>
          <b>{i18n.login.close.toString()}</b>
        </button>
      </Linkable>
    </Flex.Column>
  );
};
