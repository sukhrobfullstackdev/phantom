/* eslint-disable react/destructuring-assignment */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */

import React, { useCallback, useMemo } from 'react';
import { CallToAction, clsx, Flex, mergeProps, Icon } from '@magiclabs/ui';
import { capitalize } from '~/app/libs/lodash-utils';
import { useCloseUIThread } from '~/app/ui/hooks/ui-thread-hooks';
import { LoginMethodType } from '~/app/constants/flags';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { T } from '~/app/libs/i18n';
import { useLoginPageContext } from '../context';
import CompanyLogo from '~/shared/svg/company-logo';
import RevealLoginTypeIcon from '~/shared/svg/reveal-private-key';

import styles from './base-login-button.less';

interface BaseLoginButtonProps {
  loginType: LoginMethodType;
  loginArg: string;
  textLabel: string | T<'provider'>;
  ariaLabel?: string | T<'provider'>;
  size?: 'full' | 'condensed';
  disabled?: boolean;
  onPress?: React.ComponentProps<typeof CallToAction>['onPress'];
}

const BaseLoginButton: React.FC<BaseLoginButtonProps> = props => {
  const { loginType, loginArg = '', textLabel, ariaLabel, disabled, onPress: parentOnPress } = props;
  const { theme } = useTheme();
  const { setFocusedProvider, initiateRequest } = useLoginPageContext();

  const doLogin = useCloseUIThread([loginType, loginArg]);

  const onPress = useCallback(() => {
    switch (loginType) {
      case LoginMethodType.EmailLink:
      case LoginMethodType.SMS:
      case LoginMethodType.WebAuthn:
        return setFocusedProvider(loginType);

      case LoginMethodType.OAuth2:
      default:
        initiateRequest();
        return doLogin();
    }
  }, [initiateRequest, doLogin, loginType]);

  const icon = useMemo(() => {
    if (loginType === LoginMethodType.OAuth2) {
      // For OAuth2 login buttons, we need to load
      // an icon for the specific provider.
      return CompanyLogo[`${capitalize(loginArg)}Icon`];
    }

    return RevealLoginTypeIcon[`${capitalize(loginType)}RevealIcon`];
  }, [loginType, loginArg, theme.key]);

  const textLabelResolved = typeof textLabel === 'string' ? textLabel : textLabel.toString();
  const arialabelResolved =
    (typeof ariaLabel === 'string'
      ? ariaLabel
      : ariaLabel?.toString({
          provider: loginType === LoginMethodType.OAuth2 ? loginArg : loginType,
        })) ?? textLabelResolved;

  return (
    <Flex.Column className={clsx(styles.BaseLoginButton)}>
      <CallToAction
        outline
        style={{ borderColor: theme.isDarkTheme ? '#424242' : '#DDDBE0' }}
        className={styles.buttonBorder}
        disabled={disabled}
        {...mergeProps({ onPress: parentOnPress }, { onPress })}
        aria-label={arialabelResolved}
      >
        <div className={clsx(styles.btnContent)} aria-hidden="true">
          {icon && <Icon className={clsx(styles.icon)} type={icon} />}
          <span>{textLabelResolved}</span>
        </div>
      </CallToAction>
    </Flex.Column>
  );
};

export function createBaseLoginButton<G extends BaseLoginButtonProps>(baseProps: G) {
  const btn: React.FC<Omit<BaseLoginButtonProps, keyof G>> = props => {
    return React.createElement(BaseLoginButton, { ...baseProps, ...props });
  };

  btn.displayName = `LoginButton(${baseProps.loginType})`;

  return btn;
}
