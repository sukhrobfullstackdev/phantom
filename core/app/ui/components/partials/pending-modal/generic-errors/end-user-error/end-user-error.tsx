import React from 'react';
import { CallToAction, Flex, Spacer, Icon } from '@magiclabs/ui';
import {
  useCloseUIThread,
  useActiveControlFlowErrorMessage,
  useActiveControlFlowErrorCode,
} from '../../../../../hooks/ui-thread-hooks';
import { useSelector } from '../../../../../hooks/redux-hooks';
import { ControlFlowErrorCode } from '~/app/libs/exceptions';
import { i18n } from '~/app/libs/i18n';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { NetworkIssueIcon, TryAgainIcon } from '~/shared/svg/auth';

interface EndUserErrorProps {
  overrideMessage?: string;
}

export const EndUserError: React.FC<EndUserErrorProps> = ({ overrideMessage }) => {
  const errorMessage = useActiveControlFlowErrorMessage();
  const errorCode = useActiveControlFlowErrorCode();
  const close = useCloseUIThread(useSelector(state => state.UIThread.error));

  const errorHeading = (() => {
    switch (errorCode) {
      case ControlFlowErrorCode.DeviceNotSupported:
        return i18n.generic.browser_not_supported_heading.toMarkdown();
      case ControlFlowErrorCode.AnomalousRequestDetected:
        return i18n.generic.blocked_request.toMarkdown();
      default:
        return i18n.generic.try_again.toMarkdown();
    }
  })();

  const errorDetails = (() => {
    switch (errorCode) {
      case ControlFlowErrorCode.DeviceNotSupported:
        return i18n.generic.browser_not_supported_description.toMarkdown();
      default:
        return overrideMessage || (errorMessage ?? i18n.generic.please_provide_valid_email.toString());
    }
  })();

  const ErrorIcon = (() => {
    switch (errorCode) {
      case ControlFlowErrorCode.DeviceNotSupported:
        return NetworkIssueIcon;
      default:
        return TryAgainIcon;
    }
  })();

  const { theme } = useTheme();

  return (
    <Flex.Column horizontal="center" style={{ padding: '0 32px' }}>
      <Icon type={ErrorIcon} size={40} color={theme.hex.primary.base} />

      <Spacer size={24} orientation="vertical" />

      <h2 className="fontCentered">{errorHeading}</h2>

      <Spacer size={8} orientation="vertical" />

      <div className="fontDescriptionSmall fontCentered">{errorDetails}</div>

      <Spacer size={40} orientation="vertical" />

      <CallToAction onPress={close}>{i18n.generic.close.toString()}</CallToAction>
    </Flex.Column>
  );
};
