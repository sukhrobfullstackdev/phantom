import React from 'react';
import { CallToAction, Flex, Spacer, Icon, MonochromeIcons } from '@magiclabs/ui';
import { useCloseUIThread, useActiveControlFlowErrorCode } from '../../../../../hooks/ui-thread-hooks';
import { useSelector } from '../../../../../hooks/redux-hooks';
import { ControlFlowErrorCode } from '~/app/libs/exceptions';
import { i18n } from '~/app/libs/i18n';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { LockIcon } from '~/shared/svg/mfa';
import { DeniedIcon } from '~/shared/svg/auth';

const getErrorHeading = (errorCode, appName) => {
  const headingPrivate = i18n.login.app_is_private.toMarkdown({ appName });
  const headingBlocked = i18n.login.access_denied.toMarkdown();
  //  Todo add i18n for MAUExceeded
  const headingMAUExceeded = i18n.login.mau_limit_exceeded_heading.toMarkdown();

  switch (errorCode) {
    case ControlFlowErrorCode.UserEmailNotAllowed:
      return headingPrivate;
    case ControlFlowErrorCode.MAUServiceLimitExceeded:
      return headingMAUExceeded;
    case ControlFlowErrorCode.UserEmailBlocked:
    default:
      return headingBlocked;
  }
};

const getErrorMessage = (errorCode, userEmail, appName) => {
  const messagePrivate1 = i18n.login.cannot_access_private_app.toMarkdown({ userEmail });
  const messagePrivate2 = i18n.login.think_theres_a_mistake.toMarkdown({ appName });
  const messageBlocked = i18n.login.email_blocked_message.toMarkdown({ appName });
  // Todo add i18n for MAUExceeded
  const mau_limit_exceeded_description = i18n.login.mau_limit_exceeded_description.toMarkdown({ appName });

  switch (errorCode) {
    case ControlFlowErrorCode.UserEmailNotAllowed:
      return (
        <>
          {messagePrivate1} <Spacer size={8} orientation="vertical" /> {messagePrivate2}
        </>
      );
    case ControlFlowErrorCode.MAUServiceLimitExceeded:
      return mau_limit_exceeded_description;
    case ControlFlowErrorCode.UserEmailBlocked:
    default:
      return <>{messageBlocked}</>;
  }
};

const getErrorIconType = errorCode => {
  switch (errorCode) {
    case ControlFlowErrorCode.UserEmailNotAllowed:
      return LockIcon;
    case ControlFlowErrorCode.MAUServiceLimitExceeded:
      return MonochromeIcons.LaptopWithCode;
    case ControlFlowErrorCode.UserEmailBlocked:
    default:
      return DeniedIcon;
  }
};

const getErrorIconHex = errorCode => {
  const { theme } = useTheme();

  switch (errorCode) {
    case ControlFlowErrorCode.UserEmailNotAllowed:
      return theme.hex.primary.base;
    case ControlFlowErrorCode.UserEmailBlocked:
    default:
      return '#B6B4BA';
  }
};

export const UserAccessError: React.FC = () => {
  const errorCode = useActiveControlFlowErrorCode();
  const close = useCloseUIThread(useSelector(state => state.UIThread.error));
  const userEmail = useSelector(state => state.Auth.userEmail);
  const { theme } = useTheme();

  return (
    <Flex.Column horizontal="center" style={{ padding: '0 32px' }}>
      <Icon type={getErrorIconType(errorCode)} size={40} color={getErrorIconHex(errorCode)} />

      <Spacer size={24} orientation="vertical" />

      <h2 className="fontCentered">{getErrorHeading(errorCode, theme.appName)}</h2>

      <Spacer size={8} orientation="vertical" />

      <div className="fontDescriptionSmall fontCentered">{getErrorMessage(errorCode, userEmail, theme.appName)}</div>

      <Spacer size={40} orientation="vertical" />

      <CallToAction onPress={close}>{i18n.generic.close.toString()}</CallToAction>
    </Flex.Column>
  );
};
