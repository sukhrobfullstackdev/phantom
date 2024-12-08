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
import { i18n, T } from '~/app/libs/i18n';
import { useLoginPageContext } from '../context';
import CompanyLogo from '~/shared/svg/company-logo';
import PnpLoginTypeIcon from '~/shared/svg/pnp';

import styles from './base-login-button.less';

interface BaseLoginButtonProps {
  loginType: LoginMethodType;
  loginArg?: any;
  textLabel: string | T<'provider'>;
  ariaLabel?: string | T<'provider'>;
  size?: 'full' | 'condensed';
  disabled?: boolean;
  onPress?: React.ComponentProps<typeof CallToAction>['onPress'];
}

const BaseLoginButton: React.FC<BaseLoginButtonProps> = props => {
  const { loginType, loginArg, textLabel, ariaLabel, size, disabled, onPress: parentOnPress } = props;
  const { theme } = useTheme();
  const { lastUsedProvider, setFocusedProvider, initiateRequest } = useLoginPageContext();

  const doLogin = useCloseUIThread([loginType, loginArg]);

  const onPress = useCallback(() => {
    switch (loginType) {
      case LoginMethodType.EmailLink:
      case LoginMethodType.SMS:
        return setFocusedProvider(loginType);

      case LoginMethodType.OAuth2:
      default:
        initiateRequest();
        return doLogin();
    }
  }, [initiateRequest, doLogin, loginType]);

  const greenLight =
    loginType === LoginMethodType.OAuth2 ? lastUsedProvider === loginArg : lastUsedProvider === loginType;

  const icon = useMemo(() => {
    if (loginType === LoginMethodType.OAuth2) {
      // For OAuth2 login buttons, we need to load
      // an icon for the specific provider.
      return CompanyLogo[`${capitalize(loginArg)}Icon`];
    }

    return PnpLoginTypeIcon[`${capitalize(loginType)}PNPIcon`];
  }, [loginType, loginArg, theme.key]);

  const textLabelResolved = typeof textLabel === 'string' ? textLabel : textLabel.toString();
  const arialabelResolved =
    (typeof ariaLabel === 'string'
      ? ariaLabel
      : ariaLabel?.toString({
          provider: loginType === LoginMethodType.OAuth2 ? loginArg : loginType,
        })) ?? textLabelResolved;

  const yourPreviousLoginMethod = i18n.pnp.your_previous_login_method.toString();
  const isCondensed = size === 'condensed';

  return (
    <Flex.Column className={clsx(styles.BaseLoginButton, isCondensed && styles.condensed)}>
      <CallToAction
        outline
        disabled={disabled}
        {...mergeProps({ onPress: parentOnPress }, { onPress })}
        aria-label={greenLight ? `${arialabelResolved}, ${yourPreviousLoginMethod}` : arialabelResolved}
      >
        <div className={clsx(styles.btnContent, isCondensed && styles.condensed)} aria-hidden="true">
          {icon && <Icon className={clsx(styles.icon, isCondensed && styles.condensed)} type={icon} />}
          {!isCondensed && <span>{textLabelResolved}</span>}
          {greenLight && <div className={clsx(styles.greenLight, isCondensed && styles.condensed)} />}{' '}
        </div>
      </CallToAction>

      {greenLight && !isCondensed && (
        <div className={styles.greenLightLabel} aria-hidden="true">
          {yourPreviousLoginMethod}
        </div>
      )}
    </Flex.Column>
  );
};

export function createBaseLoginButton<T extends BaseLoginButtonProps>(baseProps: T) {
  const btn: React.FC<Omit<BaseLoginButtonProps, keyof T>> = props => {
    return React.createElement(BaseLoginButton, { ...baseProps, ...props });
  };

  btn.displayName = `LoginButton(${baseProps.loginType})`;

  return btn;
}
