import { CallToAction, Flex, Icon, Spacer, TextField, Typography } from '@magiclabs/ui';
import React, { useEffect, useState } from 'react';
import { useAsyncEffect } from 'usable-react';
import { isServiceError, sdkErrorFactories } from '~/app/libs/exceptions';
import { store } from '~/app/store';
import { ThemeLogo } from '~/app/ui/components/widgets/theme-logo';
import { useCloseUIThread } from '~/app/ui/hooks/ui-thread-hooks';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { BasePage } from '~/features/connect-with-ui/components/base-page/base-page';
import { CallToActionStateful } from '~/features/connect-with-ui/components/call-to-action-overload';
import { EnvelopeIcon } from '~/shared/svg/magic-connect';
import { CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { OverlapIcons } from '~/features/connect-with-ui/components/overlap-icons';
import { useUserDappInfoRequest } from '~/features/connect-with-ui/hooks/useUserDappInfoRequest';
import { isLoginMethodAThirdPartyWallet, resolveUserDataRequest } from './request-user-info.controller';
import styles from './request-user-info-page.less';
import { getUserProfile, updateUserProfile } from '~/features/connect-with-ui/services/dapp-user-info-request';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { setThirdPartyWalletRequestUserInfo } from '~/features/connect-with-ui/store/connect.actions';
import { connectStore } from '~/features/connect-with-ui/store';
import { isValidEmail } from '~/shared/libs/validators';
import { i18n } from '~/app/libs/i18n';
import { eventData } from '~/features/connect-with-ui/utils/get-login-method';
import { getLogger } from '~/app/libs/datadog';
import { buildMessageContext } from '~/app/libs/analytics-datadog-helpers';

export const RequestUserInfoPage = () => {
  const { theme } = useTheme();
  const { navigateTo } = useControllerContext();
  const [isThirdPartyWallet, setIsThirdPartyWallet] = useState(false);
  const email = store.hooks.useSelector(state => state.Auth.userEmail);
  const cancel = useCloseUIThread(sdkErrorFactories.magic.userRejectAction());
  const { isLoading, logEmailUserDappInfoConsent, error } = useUserDappInfoRequest();
  const [emailAddress, setEmailAddress] = useState('');
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const userId = store.hooks.useSelector(state => state.Auth.userID);

  const isResponseRequired = store.hooks.useSelector(
    state => state.User.requestUserInfoRouteParams?.isResponseRequired || '',
  );

  useAsyncEffect(async () => {
    const isThirdPartyWalletLogin = await isLoginMethodAThirdPartyWallet();
    setIsThirdPartyWallet(isThirdPartyWalletLogin);
  }, []);

  useAsyncEffect(async () => {
    try {
      if (!isThirdPartyWallet) return;

      const userProfile = await getUserProfile(userId);
      setEmailAddress(userProfile.data.value);
    } catch (e) {
      getLogger().error(`Error with getUserProfile`, buildMessageContext(e));
    }
  }, [isThirdPartyWallet]);

  const resolveEmailRequest = () => {
    if (!error) {
      resolveUserDataRequest();
    }
  };

  const logShareRequest = async () => {
    await logEmailUserDappInfoConsent(email);
  };

  const onChangeEmailHandler = e => {
    setEmailAddress(e.target.value);
  };

  useEffect(() => {
    if (!emailAddress?.length) {
      return setEmailErrorMessage('');
    }

    if (isValidEmail(emailAddress)) {
      return setEmailErrorMessage('');
    }

    return setEmailErrorMessage(i18n.login_sms.enter_valid_email_address.toString());
  }, [emailAddress]);

  const onClickNextHandler = async () => {
    await connectStore.dispatch(
      setThirdPartyWalletRequestUserInfo({
        email: emailAddress,
      }),
    );
    navigateTo('request-user-info-third-party-wallet-email-verify', eventData);
  };

  const onClickCancelHandler = async () => {
    try {
      await updateUserProfile({
        auth_user_id: userId,
        email: isThirdPartyWallet ? emailAddress : email,
        consent_granted: false,
        type: 'email',
      });
    } catch (e) {
      if (isServiceError(e)) {
        e.getControlFlowError().setUIThreadError();
      }
    } finally {
      cancel();
    }
  };

  const renderCancelButton = () => {
    if (isResponseRequired) return null;

    return (
      <>
        <CallToAction onClick={onClickCancelHandler} color="secondary">
          No thanks
        </CallToAction>
        <Spacer size={16} />
      </>
    );
  };

  return (
    <>
      <ModalHeader
        rightAction={<CancelActionButton />}
        header={
          <Typography.BodySmall weight="400" color={theme.isDarkTheme ? 'var(--chalk72)' : 'var(--ink70)'}>
            {email}
          </Typography.BodySmall>
        }
      />
      <BasePage className={styles.requestUserInfoPage}>
        <Spacer size={32} orientation="vertical" />
        <OverlapIcons
          right={
            <ThemeLogo
              height="56px"
              width="56px"
              style={{
                borderRadius: '50%',
              }}
            />
          }
          left={
            <OverlapIconWrapper>
              <Icon type={EnvelopeIcon} color={theme.hex.primary.base} />
            </OverlapIconWrapper>
          }
        />
        <Spacer size={24} orientation="vertical" />
        <Typography.H4 weight="700">
          {isResponseRequired ? 'Email address required' : 'Share email address?'}
        </Typography.H4>
        <Spacer size={8} orientation="vertical" />
        <Typography.BodyMedium color={theme.isDarkTheme ? 'var(--chalk72)' : 'var(--ink70)'} weight="400">
          {isResponseRequired
            ? `To continue, ${theme.appName} needs access to your email address.`
            : `${theme.appName} is requesting access to your email address.`}
        </Typography.BodyMedium>
        <Spacer size={32} orientation="vertical" />
        <Typography.BodySmall weight="500">Email address</Typography.BodySmall>
        <Spacer size={8} orientation="vertical" />
        {isThirdPartyWallet && (
          <div style={{ width: '100%' }}>
            <TextField
              style={{ width: '100%' }}
              onChange={e => onChangeEmailHandler(e)}
              value={emailAddress}
              type="email"
              placeholder="hiro@magic.link"
              errorMessage={emailErrorMessage}
            />
          </div>
        )}
        {!isThirdPartyWallet && <Typography.BodyMedium weight="400">{email}</Typography.BodyMedium>}
        <Spacer size={32} orientation="vertical" />
        {isThirdPartyWallet && (
          <Flex.Row className={styles.actionContainer} style={{ width: '100%' }}>
            {renderCancelButton()}
            <CallToAction
              disabled={emailAddress?.length <= 0 || emailErrorMessage?.length > 0}
              onClick={onClickNextHandler}
              color="primary"
            >
              Next
            </CallToAction>
          </Flex.Row>
        )}
        {!isThirdPartyWallet && (
          <Flex.Row className={styles.actionContainer}>
            {renderCancelButton()}
            <CallToActionStateful
              onHideSuccess={resolveEmailRequest}
              onClick={logShareRequest}
              isLoading={isLoading}
              color="primary"
            >
              Share
            </CallToActionStateful>
          </Flex.Row>
        )}
      </BasePage>
    </>
  );
};

export const OverlapIconWrapper = ({ children }) => {
  const { theme } = useTheme();
  return (
    <Flex.Row
      justifyContent="center"
      alignItems="center"
      style={{
        width: '56px',
        height: '56px',
        backgroundColor: theme.rgba.primary.lighter.string(0.2),
        borderRadius: '50%',
      }}
    >
      {children}
    </Flex.Row>
  );
};
