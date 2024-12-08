import { Icon, Spacer, useAnnouncer } from '@magiclabs/ui';
import React, { useEffect } from 'react';
import { useTimer, useTimerComplete } from 'usable-react';
import { i18n } from '~/app/libs/i18n';
import { smsLoginStore } from '../../store';
import { setIsCloseButtonEnabled } from '../../store/login-with-sms.actions';
import { LoginWithSmsPage } from '../partials/login-with-sms-page';
import styles from './security-lockout-page.less';
import { LockoutIcon } from '~/shared/svg/sms';

type SecurityLockoutPageProps = {
  onLiftLockout: () => Promise<any> | void;
};

export const SecurityLockoutPage = ({ onLiftLockout }: SecurityLockoutPageProps) => {
  const announce = useAnnouncer();
  const smsRetryGateMs = smsLoginStore.hooks.useSelector(state => state.smsRetryGate);
  const lockoutTimer = useTimer({ length: smsRetryGateMs || 30000 });
  const { start, getRemaining } = lockoutTimer;

  useTimerComplete(lockoutTimer, () => {
    onLiftLockout();
  });

  useEffect(() => {
    start();
    smsLoginStore.dispatch(setIsCloseButtonEnabled(true));
    announce(i18n.login_sms.security_lockout_info_timer.toString());
  }, []);

  const formatRemainingTime = () => {
    const remainingTime = new Date(Math.floor(getRemaining()));
    return `${remainingTime.getMinutes()}:${remainingTime.getSeconds()}`;
  };

  return (
    <LoginWithSmsPage>
      <Icon type={LockoutIcon} size={44} />
      <Spacer size={24} orientation="vertical" />
      <h4 className={styles.lockoutTitle}>{i18n.login_sms.security_lockout.toMarkdown()}</h4>
      <Spacer size={12} orientation="vertical" />
      <div className={styles.lockoutMessage}>{i18n.login_sms.security_lockout_info_message.toMarkdown()}</div>
      <Spacer size={32} orientation="vertical" />
      <div className={styles.lockoutTimer} aria-hidden="true">
        <span>
          {i18n.login_sms.security_lockout_info_timer.toString()} <strong>{formatRemainingTime()}</strong>
        </span>
      </div>
    </LoginWithSmsPage>
  );
};
