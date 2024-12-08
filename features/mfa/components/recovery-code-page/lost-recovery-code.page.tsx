import React from 'react';
import { Spacer } from '@magiclabs/ui';
import { i18n } from '~/app/libs/i18n';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { mfaStore } from '../../store';
import { rejectUserCancelled } from '../../store/mfa.thunks';
import styles from './recovery-code-page.less';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { BackActionButton, CancelActionButton } from '~/app/ui/components/widgets/modal-action-button/';
import { ThemeLogo } from '~/app/ui/components/widgets/theme-logo';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';

export type LostRecoveryCodePageProps = {
  navBackRoute?: string;
};

export const LostRecoveryCodePage = ({ navBackRoute }: LostRecoveryCodePageProps) => {
  const { navigateTo } = useControllerContext();
  const { theme } = useTheme();

  return (
    <div className={styles.recoveryCodePage}>
      <ModalHeader leftAction={navBackRoute ? <BackActionButton onClick={() => navigateTo(navBackRoute)} /> : null} />
      <ThemeLogo height="48px" />
      <Spacer size={32} orientation="vertical" />
      <div className={styles.title}>
        {i18n.mfa.lost_recovery_code_contact.toString({
          appName: theme.appName,
        })}
      </div>
      <Spacer size={8} orientation="vertical" />
      <div className={styles.lostRecoveryCodeBody}>
        {i18n.mfa.lost_recovery_code_body.toString({
          appName: theme.appName,
        })}
      </div>
    </div>
  );
};

export type LockoutRecoveryCodePageProps = {
  lockoutExitRoute?: string;
  hideActions?: boolean;
};

export const LockoutRecoveryCodePage = ({ lockoutExitRoute, hideActions }: LockoutRecoveryCodePageProps) => {
  const { navigateTo } = useControllerContext();
  const returnToOrClose = () => {
    if (lockoutExitRoute) navigateTo(lockoutExitRoute);
    else mfaStore.dispatch(rejectUserCancelled());
  };

  return (
    <>
      <ModalHeader rightAction={!hideActions ? <CancelActionButton onClick={returnToOrClose} /> : null} />
      <LostRecoveryCodePage />
    </>
  );
};
