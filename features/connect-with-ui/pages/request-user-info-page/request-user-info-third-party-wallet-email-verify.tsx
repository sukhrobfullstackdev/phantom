import { Flex, Icon, Spacer, Typography } from '@magiclabs/ui';
import React, { useEffect, useState } from 'react';
import { useAsyncEffect } from 'usable-react';
import { ServiceError } from '~/app/libs/exceptions';
import { store } from '~/app/store';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { BasePage } from '~/features/connect-with-ui/components/base-page/base-page';
import { EnvelopeIcon } from '~/shared/svg/magic-connect';
import { BackActionButton, CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { usePinCode } from '~/app/ui/components/widgets/pin-code-input/usePinCode';
import {
  updateUserProfile,
  verifyUserProfileFlowComplete,
  verifyUserProfileFlowStart,
} from '~/features/connect-with-ui/services/dapp-user-info-request';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { connectStore } from '../../store';
import { resolveUserDataRequest } from './request-user-info.controller';
import { setUserEmail } from '~/app/store/auth/auth.actions';
import {
  INCORRECT_VERIFICATION_CODE,
  LOGIN_THROTTLED,
  VERIFICATION_CODE_EXPIRED,
} from '~/features/email-otp/services/email-otp/errorCodes';
import { i18n } from '~/app/libs/i18n';
import styles from './request-user-info-third-party-wallet-email-verify.less';
import { LoadingSpinner } from '~/app/ui/components/widgets/loading-spinner';
import { eventData } from '~/features/connect-with-ui/utils/get-login-method';
import { getLogger } from '~/app/libs/datadog';
import { buildMessageContext } from '~/app/libs/analytics-datadog-helpers';

export const RequestUserInfoThirdPartyWalletEmailVerify = () => {
  const { theme } = useTheme();
  const { navigateTo } = useControllerContext();
  const [verifyFlowContext, setVerifyFlowContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const email = store.hooks.useSelector(state => state.Auth.userEmail);
  const userId = store.hooks.useSelector(state => state.Auth.userID);

  const thirdPartyWalletRequestUserInfoEmail = connectStore.hooks.useSelector(
    state => state.thirdPartyWalletRequestUserInfo?.email || '',
  );

  const { PinCodeInput, pinCodeInputProps, clearPinCodeInput, focusForm } = usePinCode({
    onComplete: async oneTimeCode => {
      setIsLoading(true);
      try {
        const verifyFlowCompleteResponse = await verifyUserProfileFlowComplete(userId, verifyFlowContext, oneTimeCode);
        const updateUserProfileResponse = await updateUserProfile({
          auth_user_id: userId,
          email: thirdPartyWalletRequestUserInfoEmail,
          consent_granted: true,
          type: 'email',
        });
        await store.dispatch(setUserEmail(thirdPartyWalletRequestUserInfoEmail));
        await resolveUserDataRequest();
      } catch (e) {
        const serviceErrorCode = (e as ServiceError).code;
        if (serviceErrorCode === INCORRECT_VERIFICATION_CODE || serviceErrorCode === VERIFICATION_CODE_EXPIRED) {
          setErrorMsg(i18n.login_sms.invalid_code_info_message.toString());
          clearPinCodeInput();
        }
        if (e === LOGIN_THROTTLED) {
          setErrorMsg(i18n.login_sms.security_lockout_too_many_attempts.toString());
        }
      }
      setIsLoading(false);
    },
    onChange: () => setErrorMsg(''),
  });

  useEffect(() => {
    focusForm();
  }, []);

  useAsyncEffect(async () => {
    try {
      const result = await verifyUserProfileFlowStart(userId, thirdPartyWalletRequestUserInfoEmail);
      setVerifyFlowContext(result.data.verify_flow_context);
    } catch (e) {
      getLogger().error(`Error with verifyUserProfileFlowStart`, buildMessageContext(e));
    }
  }, []);

  return (
    <>
      <ModalHeader
        leftAction={
          <BackActionButton disabled={isLoading} onClick={() => navigateTo('request-user-info', eventData)} />
        }
        rightAction={<CancelActionButton disabled={isLoading} />}
        header={
          <Typography.BodySmall weight="400" color={theme.color.mid.base.toString()}>
            {email}
          </Typography.BodySmall>
        }
      />
      <BasePage className={styles.requestUserInfoPage}>
        <Spacer size={16} orientation="vertical" />
        <Flex.Row justifyContent="center" style={{ width: '100%' }}>
          <Icon type={EnvelopeIcon} size={40} />
        </Flex.Row>
        <Spacer size={16} orientation="vertical" />
        <Typography.BodyLarge weight="400" className={styles.email}>
          Please enter the code sent to <b>{thirdPartyWalletRequestUserInfoEmail}</b>
        </Typography.BodyLarge>
        <Spacer size={32} orientation="vertical" />
        {isLoading ? <LoadingSpinner small /> : <PinCodeInput {...pinCodeInputProps} />}
        {errorMsg && (
          <>
            <Spacer size={12} orientation="vertical" />
            <div className={`${styles.statusMessage} ${styles.statusMessageError}`}>{errorMsg}</div>
          </>
        )}
      </BasePage>
    </>
  );
};
