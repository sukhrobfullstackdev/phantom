/* eslint-disable react/destructuring-assignment */

import React, { useCallback, useEffect } from 'react';
import { CallToAction, Spacer, Icon } from '@magiclabs/ui';
import styles from './account-recovered-page.less';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { AppNameHeader } from '~/app/ui/components/widgets/modal-action-button';
import { SuccessShieldLogo } from '~/shared/svg/account-recovery';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { i18n } from '~/app/libs/i18n';
import { updateEmailStore } from '~/features/update-email/store';
import { initUpdateEmailState } from '~/features/update-email/store/update-email.actions';
import { useCloseUIThread } from '~/app/ui/hooks/ui-thread-hooks';
import { store } from '~/app/store';
import { SystemThunks } from '~/app/store/system/system.thunks';
import { JsonRpcRequestPayload, RecoverAccountEmit, RecoverAccountOnReceived } from 'magic-sdk';
import { RpcIntermediaryEventService } from '~/app/services/rpc-intermediary-event';

export const AccountRecoveredPage: React.FC = () => {
  const { LAUNCH_DARKLY_FEATURE_FLAGS } = store.hooks.useSelector(state => state.System);
  const { navigateTo } = useControllerContext();
  const payload = store.getState()?.ActivePayload?.activePayload;
  const updateEmail = useCallback(() => {
    updateEmailStore.dispatch(initUpdateEmailState());
    navigateTo('update-email-input-address');
  }, []);
  useEffect(() => {
    console.log('payload', payload);
    store.dispatch(SystemThunks.emitJsonRpcEvent({
      payload: payload as JsonRpcRequestPayload<any>,
      event: RecoverAccountOnReceived.AccountRecovered,
    }));
    RpcIntermediaryEventService.on(RecoverAccountEmit.UpdateEmailAddress, payload as JsonRpcRequestPayload<any>, () => {
      updateEmail();
     });
  }, []);
  const close = useCloseUIThread(true);
  return (
    <>
      <ModalHeader header={<AppNameHeader />} />
      <div className={styles.accountRecoveredPage}>
        <Spacer size={32} orientation="vertical" />
        <Icon className={styles.logo} type={SuccessShieldLogo} />
        <Spacer size={24} orientation="vertical" />
        <h1 className={styles.title}>Account recovered</h1>
        {LAUNCH_DARKLY_FEATURE_FLAGS['update-email-flow-after-account-recovered-enabled'] ? (
          <>
            <div className={styles.description}>
              To keep your account secure, you’ll need to update your email address
            </div>
            <Spacer size={32} orientation="vertical" />
            <CallToAction onClick={updateEmail} style={{ width: '100%' }}>
              {i18n.update_email.update_email_address.toString()}
            </CallToAction>
          </>
        ) : (
          <>
            <div className={styles.description}>
              If you lost access to your primary login, we recommend adding a new one
            </div>
            <Spacer size={32} orientation="vertical" />
            <CallToAction onClick={close} style={{ width: '100%' }}>
              Understood
            </CallToAction>
          </>
        )}
      </div>
    </>
  );
};
