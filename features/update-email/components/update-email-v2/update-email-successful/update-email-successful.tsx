import React, { useEffect } from 'react';
import { CallToAction, Spacer, Icon } from '@magiclabs/ui';
import styles from './update-email-successful.less';
import { useCloseUIThread } from '~/app/ui/hooks/ui-thread-hooks';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { AppNameHeader } from '~/app/ui/components/widgets/modal-action-button';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { i18n } from '~/app/libs/i18n';
import { SuccessCheckmark } from '~/shared/svg/magic-connect';
import { useSelector } from '~/app/ui/hooks/redux-hooks';
import { store } from '~/app/store';
import { SystemThunks } from '~/app/store/system/system.thunks';
import { JsonRpcRequestPayload, RecoverAccountOnReceived } from 'magic-sdk';

export const UpdateEmailSuccessful: React.FC = () => {
  const close = useCloseUIThread(true);
  const { theme } = useTheme();
  const userEmail = useSelector(state => state.Auth.userEmail);
  const payload = store.getState()?.ActivePayload?.activePayload;
  useEffect(() => {
    store.dispatch(SystemThunks.emitJsonRpcEvent({
      payload: payload as JsonRpcRequestPayload<any>,
      event: RecoverAccountOnReceived.EmailAddressUpdated,
    }));
  }, []);
  return (
    <>
      <ModalHeader header={<AppNameHeader />} />
      <div className={styles.updateEmailSuccessfulPage}>
        <Spacer size={32} orientation="vertical" />
        <Icon className={styles.logo} type={SuccessCheckmark} />
        <Spacer size={24} orientation="vertical" />
        <h1 className={styles.title}>{i18n.update_email.email_address_updated.toString()}</h1>
        <div className={styles.description}>
          {i18n.update_email.email_address_updated_description.toMarkdown({
            appName: theme.appName,
            userEmail,
          })}
        </div>
        <Spacer size={32} orientation="vertical" />
        <CallToAction onClick={close} style={{ width: '100%' }}>
          Close
        </CallToAction>
      </div>
    </>
  );
};
