import React, { useCallback, useEffect, useState } from 'react';
import { CallToAction, Flex, Icon, Spacer, TextField } from '@magiclabs/ui';
import { useTheme } from '~/app/ui/hooks/use-theme';
import styles from './input-new-email-address.less';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { AppNameHeader, BackActionButton, CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { i18n } from '~/app/libs/i18n';
import { EditEmailLogo } from '~/shared/svg/auth';
import { updateEmailStore } from '~/features/update-email/store';
import { setToBeUpdatedEmail } from '~/features/update-email/store/update-email.actions';
import { useUpdateEmailAddressHooks } from '~/features/update-email/hooks/updateEmailAddressHooks';
import { ACCOUNT_ALREADY_EXISTS } from '~/features/recovery/services/recovery/errorCodes';
import { MALFORMED_EMAIL } from '~/features/update-email/services/update-email-address-error-codes';
import { UIThreadThunks } from '~/app/store/ui-thread/ui-thread.thunks';
import { useDispatch } from '~/app/ui/hooks/redux-hooks';
import { sdkErrorFactories } from '~/app/libs/exceptions';
import { recoveryStore } from '~/features/recovery/store';
import { store } from '~/app/store';
import { SystemThunks } from '~/app/store/system/system.thunks';
import { JsonRpcRequestPayload, RecoverAccountEmit, RecoverAccountOnReceived } from 'magic-sdk';
import { RpcIntermediaryEventService } from '~/app/services/rpc-intermediary-event';

interface InputNewEmailAddressProps {
  returnToRoute: string | undefined;
}

export const InputNewEmailAddress: React.FC<InputNewEmailAddressProps> = ({ returnToRoute }) => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const { navigateTo } = useControllerContext();
  const [errorMsg, setErrorMsg] = useState('');
  const { error, createAuthUserFactorForNewEmail } = useUpdateEmailAddressHooks();
  const isDeepLink = recoveryStore.hooks.useSelector(state => state.isDeepLink);
  const showCancel = !!returnToRoute || isDeepLink;
  const payload = store.getState()?.ActivePayload?.activePayload;
  const [requestInProgress, setRequestInProgress] = useState(false);

  // Redux Data store
  const updatedEmail = updateEmailStore.hooks.useSelector(state => state.updatedEmail) ?? '';

  const [email, setEmail] = useState(updatedEmail);

  const handleEmailInputOnChange = useCallback(
    e => {
      setErrorMsg('');
      setEmail(e.target.value);
      return updateEmailStore.dispatch(setToBeUpdatedEmail(e.target.value));
    },
    [email],
  );

  useEffect(() => {
    if (error === ACCOUNT_ALREADY_EXISTS || error === MALFORMED_EMAIL) {
      setErrorMsg(i18n.update_email.account_already_exists.toString({ type: 'email address', appName: theme.appName }));
    }
  }, [error]);

  const doUpdateEmail = useCallback(async () => {
    setRequestInProgress(true);
    const isSuccessful = await createAuthUserFactorForNewEmail();
    setRequestInProgress(false);
    if (isSuccessful) {
      navigateTo('update-email-otp-verification');
    }
  }, []);
  useEffect(() => {
    store.dispatch(SystemThunks.emitJsonRpcEvent({
      payload: payload as JsonRpcRequestPayload<any>,
      event: RecoverAccountOnReceived.EnterNewEmail,
    }));
    RpcIntermediaryEventService.on(RecoverAccountEmit.SendNewEmail, payload as JsonRpcRequestPayload<any>, (email: string) => {
      updateEmailStore.dispatch(setToBeUpdatedEmail(email));
      doUpdateEmail();
     });
  }, []);
  const handleSubmitOnEnter: React.KeyboardEventHandler<HTMLInputElement> = useCallback(
    e => {
      if (e.key === 'Enter') {
        doUpdateEmail();
      }
    },
    [doUpdateEmail],
  );

  const cancel = useCallback(() => {
    if (isDeepLink) {
      dispatch(UIThreadThunks.releaseLockAndHideUI({ error: sdkErrorFactories.magic.userRejectAction() }));
    } else {
      navigateTo('auth-settings');
    }
  }, []);

  return (
    <div className={styles.InputNewEmailAddress}>
      <ModalHeader
        leftAction={returnToRoute ? <BackActionButton onClick={() => navigateTo(returnToRoute)} /> : null}
        rightAction={showCancel ? <CancelActionButton /> : null}
        header={<AppNameHeader />}
      />
      <Spacer size={36} orientation="vertical" />
      <Icon type={EditEmailLogo} color={theme.color.primary.base.toString()} />
      <Spacer size={32} orientation="vertical" />
      <h1 className={styles.title}>{i18n.update_email.update_email_address.toString()}</h1>
      <div className={styles.description}> {i18n.update_email.description.toString({ appName: theme.appName })}</div>
      <Spacer size={32} orientation="vertical" />
      <div>
        <TextField
          disabled={requestInProgress}
          placeholder={i18n.pnp.email_address.toString()}
          value={email}
          onKeyPress={handleSubmitOnEnter}
          onChange={handleEmailInputOnChange}
          autoComplete="email"
          autoFocus
        />
      </div>
      {errorMsg && (
        <>
          <Spacer size={12} orientation="vertical" />
          <div className={`${styles.statusMessage} ${styles.statusMessageError}`}>{errorMsg}</div>
        </>
      )}
      <Spacer size={32} orientation="vertical" />
      <Flex.Row>
        {showCancel && (
          <>
            <CallToAction className={styles.cancelBtn} color="secondary" onClick={cancel}>
              {i18n.update_email.cancel.toString()}
            </CallToAction>
            <Spacer size={24} orientation="horizontal" />
          </>
        )}
        <CallToAction className={styles.signBtn} onPress={doUpdateEmail}>
          {i18n.mfa.next.toString()}
        </CallToAction>
      </Flex.Row>
    </div>
  );
};
