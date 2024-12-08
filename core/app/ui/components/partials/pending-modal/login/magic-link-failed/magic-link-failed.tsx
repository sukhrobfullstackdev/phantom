import React, { useState } from 'react';
import { useTimer, useTimerComplete } from 'usable-react';
import { CallToAction, Flex, Icon, Spacer, useSlotID } from '@magiclabs/ui';
import { useSelector } from '../../../../../hooks/redux-hooks';
import { useCloseUIThread, useEmitUIThreadEvent } from '~/app/ui/hooks/ui-thread-hooks';
import { sdkErrorFactories } from '~/app/libs/exceptions';
import { i18n } from '~/app/libs/i18n';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { HourglassIcon } from '~/shared/svg/auth';

export const MagicLinkFailed: React.FC = () => {
  const userEmail = useSelector(state => state.Auth.userEmail);
  const retry = useEmitUIThreadEvent('retry');
  const close = useCloseUIThread(sdkErrorFactories.client.userDeniedAccountAccess());

  const { theme } = useTheme();

  const [disabled, setDisabled] = useState(true);
  const timer = useTimer({ length: 5000, tick: 1000, autoStart: true });

  useTimerComplete(timer, () => {
    setDisabled(false);
  });

  const [l1, l2] = [useSlotID(), useSlotID()];

  return (
    <Flex.Column horizontal="center" role="dialog" aria-labelledby={l1} aria-describedby={l2}>
      <Icon type={HourglassIcon} size={40} color={theme.hex.primary.base} />

      <Spacer size={24} orientation="vertical" />

      <h2 id={l1} aria-hidden="true">
        {i18n.login.try_again_later.toMarkdown()}
      </h2>

      <Spacer size={8} orientation="vertical" />

      {timer.isRunning() ? (
        <div id={l2} className="fontDescriptionSmall fontCentered">
          {i18n.login.please_wait_x_seconds.toMarkdown({ seconds: (timer.getRemaining() / 1000).toString() })}
        </div>
      ) : (
        <div id={l2} className="fontDescriptionSmall fontCentered" aria-live="polite">
          {i18n.login.please_send_another_link.toMarkdown({ userEmail })}
        </div>
      )}

      <Spacer size={40} orientation="vertical" />

      <CallToAction disabled={disabled} onPress={retry}>
        {i18n.login.resend_email.toString()}
      </CallToAction>
    </Flex.Column>
  );
};
