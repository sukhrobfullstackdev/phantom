/* eslint-disable react/destructuring-assignment */

import React, { useCallback } from 'react';
import { CallToAction, Spacer, Flex, Icon } from '@magiclabs/ui';
import styles from './remove-phone-number-page.less';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { recoveryStore } from '~/features/recovery/store';
import { WarningLogo } from '~/shared/svg/account-recovery';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { BackActionButton, CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { useDeleteSmsRecovery } from '~/features/recovery/hooks/deleteSmsRecoveryHooks';
import { CallToActionStateful } from '~/features/connect-with-ui/components/call-to-action-overload';
import { resolveUserCloseSettings } from '~/features/settings/hooks/resolveUserCloseHooks';

interface RemovePhoneNumberPageProps {
  navBackRoute: string;
}

export const RemovePhoneNumberPage: React.FC<RemovePhoneNumberPageProps> = ({ navBackRoute }) => {
  const currentFactorId = recoveryStore.hooks.useSelector(state => state.currentFactorId ?? '');
  const isDeepLink = recoveryStore.hooks.useSelector(state => state.isDeepLink);
  const { navigateTo } = useControllerContext();

  const { deleteSmsRecovery, isLoading, isPhoneDeletedSuccessful } = useDeleteSmsRecovery(currentFactorId);

  const handleDelete = useCallback(async () => {
    await deleteSmsRecovery();
  }, [currentFactorId]);

  const { theme } = useTheme();

  const navBackToPhoneNumberInputPage = () => navigateTo('edit-phone-number');

  const closeModalIfDeepLink = () => {
    return isDeepLink ? resolveUserCloseSettings() : () => navigateTo('auth-settings');
  };

  return (
    <>
      <ModalHeader
        rightAction={<CancelActionButton />}
        leftAction={<BackActionButton onClick={navBackToPhoneNumberInputPage} />}
      />
      <div className={styles.removePhoneNumberPage}>
        <Spacer size={32} orientation="vertical" />
        <Icon className={styles.logo} type={WarningLogo} />
        <Spacer size={24} orientation="vertical" />
        <h1 className={styles.title}>Remove phone number?</h1>
        <div className={styles.description}>
          You will no longer be able to access {theme.appName} using your phone number
        </div>
        <Spacer size={32} orientation="vertical" />
        <Flex.Row justifyContent="space-between">
          <CallToAction
            className={styles.cancelBtn}
            style={{ width: '45%' }}
            color="secondary"
            onClick={navBackToPhoneNumberInputPage}
            size="md"
          >
            Cancel
          </CallToAction>
          <CallToActionStateful
            style={{ width: '45%' }}
            isLoading={isLoading}
            disabled={isLoading}
            onClick={handleDelete}
            isSuccessful={isPhoneDeletedSuccessful}
            showSuccessDurationMs={1000}
            color="error"
            onHideSuccess={closeModalIfDeepLink()}
          >
            Remove
          </CallToActionStateful>
        </Flex.Row>
      </div>
    </>
  );
};
