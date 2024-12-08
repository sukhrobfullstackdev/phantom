import React, { useState } from 'react';
import { useClipboard } from 'usable-react';
import { CallToAction, Icon, Spacer } from '@magiclabs/ui';
import { i18n } from '~/app/libs/i18n';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { mfaStore } from '../../store';
import { resolveMfaComplete } from '../../store/mfa.thunks';
import styles from './recovery-code-page.less';
import { KeyIcon } from '~/shared/svg/mfa';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { setEnableFlowMfaData } from '../../store/mfa.actions';

export const RecoveryCodePage = ({ returnToRoute }) => {
  const { navigateTo } = useControllerContext();
  const { copy } = useClipboard();
  const { theme } = useTheme();
  const recoveryCodes = mfaStore.hooks.useSelector(state => state.recoveryCodes);
  const [copyButtonText, setCopyButtonText] = useState(i18n.mfa.copy_code.toString());

  const returnToOrClose = () => {
    mfaStore.dispatch(setEnableFlowMfaData(undefined));
    if (returnToRoute) navigateTo(returnToRoute);
    else mfaStore.dispatch(resolveMfaComplete());
  };

  const onCopyRecoveryCode = () => {
    setCopyButtonText(i18n.mfa.copied.toString());
    setTimeout(() => setCopyButtonText(i18n.mfa.copy_code.toString()), 1500);
    copy(recoveryCodes?.join());
  };

  return (
    <div className={styles.recoveryCodePage}>
      <Icon type={KeyIcon} color={theme.color.primary.base.toString()} />
      <Spacer size={28} orientation="vertical" />
      <h1 className={styles.title}>{i18n.mfa.recovery_code_title.toString()}</h1>
      <Spacer size={8} orientation="vertical" />
      <div className={styles.lostRecoveryCodeBody}>{i18n.mfa.recovery_code_body.toString()}</div>
      <Spacer size={40} orientation="vertical" />
      <div className={styles.recoveryCodes}>{recoveryCodes?.join()}</div>
      <Spacer size={8} orientation="vertical" />
      <div className={styles.recoveryCodeLabel}>
        {i18n.mfa.recovery_code_label.toString({
          appName: theme.appName,
        })}
      </div>
      <Spacer size={40} orientation="vertical" />
      <CallToAction outline onClick={onCopyRecoveryCode}>
        {copyButtonText}
      </CallToAction>
      <Spacer size={16} orientation="vertical" />
      <CallToAction onClick={returnToOrClose}>{i18n.mfa.finish_setup.toString()}</CallToAction>
    </div>
  );
};
