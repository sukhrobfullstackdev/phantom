/* eslint-disable react/destructuring-assignment */

import React from 'react';
import { CallToAction, Spacer, Icon } from '@magiclabs/ui';
import styles from './phone-number-added-page.less';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { recoveryStore } from '~/features/recovery/store';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { isSetupRecoveryFlow } from '~/features/recovery/utils/utils';
import { SuccessShieldLogo } from '~/shared/svg/account-recovery';
import { resolveUserCloseSettings } from '~/features/settings/hooks/resolveUserCloseHooks';

interface RecoveryAddedPageProps {
  returnToRoute: string;
  flow: 'setup' | 'edit';
}

export const PhoneNumberAddedPage: React.FC<RecoveryAddedPageProps> = ({ returnToRoute, flow }) => {
  const formattedPhoneNumber = recoveryStore.hooks.useSelector(state => state.phoneNumber) ?? '';
  const selectedCountryCallingCode = recoveryStore.hooks.useSelector(state => state.selectedCountryCallingCode || '');
  const isDeepLink = recoveryStore.hooks.useSelector(state => state.isDeepLink);

  const { navigateTo } = useControllerContext();
  const { theme } = useTheme();

  return (
    <div className={styles.phoneNumberAddedPage}>
      <Spacer size={32} orientation="vertical" />
      <Icon className={styles.logo} type={SuccessShieldLogo} />
      <Spacer size={24} orientation="vertical" />
      <h1 className={styles.title}>{isSetupRecoveryFlow(flow) ? 'Phone number added' : 'Phone number updated'}</h1>
      <div className={styles.description}>
        <strong>
          {selectedCountryCallingCode} {formattedPhoneNumber}
        </strong>{' '}
        can now be used to access your {theme.appName} account
      </div>
      <Spacer size={32} orientation="vertical" />
      <CallToAction onClick={resolveUserCloseSettings()} style={{ width: '100%' }}>
        Close
      </CallToAction>
      <Spacer size={20} orientation="vertical" />
      {!isDeepLink ? (
        <button className={styles.accountSettingsLink} onClick={() => navigateTo(returnToRoute)}>
          Account Settings
        </button>
      ) : null}
    </div>
  );
};
