import React from 'react';
import { Flex, Icon, Typography } from '@magiclabs/ui';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { eventData } from '~/features/connect-with-ui/utils/get-login-method';
import styles from './fiat-onramp-provider-drawer-option.less';
import { TrackingButton } from '../tracking-button';

export const FiatOnRampProviderDrawerOption = ({ provider, setIsProviderOptionsDrawerOpen }) => {
  const { navigateTo } = useControllerContext();

  const handleProviderClick = () => {
    setIsProviderOptionsDrawerOpen(false);
    navigateTo(`wallet-fiat-onramp-${provider.name}`, eventData);
  };

  return (
    <TrackingButton actionName={provider.event}>
      <div className={styles.providerDrawerOption} onClick={handleProviderClick} role="none">
        <Flex.Row alignItems="center" justifyContent="space-between">
          <Icon type={provider.providerIcon} size={{ height: 20 }} />
          <Typography.BodySmall weight="400" className={styles.dailyLimit} style={{ fontSize: '12px' }}>
            {provider.limit}
          </Typography.BodySmall>
        </Flex.Row>
      </div>
    </TrackingButton>
  );
};
