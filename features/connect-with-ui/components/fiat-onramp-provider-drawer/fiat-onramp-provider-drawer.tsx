import { Flex, Typography } from '@magiclabs/ui';
import React from 'react';
import { Button, ButtonSize, ButtonVariant } from '../button';
import { DrawerOverlay } from '../drawer-overlay';
import { FiatOnRampProviderDrawerOption } from '../fiat-onramp-provider-drawer-option';
import { AngleDown } from '~/shared/svg/magic-connect';
import styles from './fiat-onramp-provider-drawer.less';

export const FiatOnRampProviderDrawer = ({ providers, isDrawerOpen, setIsDrawerOpen, handleOpenDrawer }) => {
  return (
    <DrawerOverlay openFrom="bottom" isDrawerOpen={isDrawerOpen} setIsDrawerOpen={setIsDrawerOpen}>
      <div>
        <Flex.Row alignItems="center" justifyContent="space-between" className={styles.providerDrawerHeader}>
          <Typography.BodyMedium weight="700">Choose a provider</Typography.BodyMedium>
          <Button
            onClick={handleOpenDrawer}
            size={ButtonSize.small}
            variant={ButtonVariant.subtle}
            iconType={AngleDown}
          />
        </Flex.Row>
        <div className={styles.providerDrawerOnrampButton}>
          {providers.map(provider => {
            return (
              <div key={provider.name}>
                {provider && (
                  <FiatOnRampProviderDrawerOption
                    provider={provider}
                    setIsProviderOptionsDrawerOpen={setIsDrawerOpen}
                    key={provider.event}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </DrawerOverlay>
  );
};
