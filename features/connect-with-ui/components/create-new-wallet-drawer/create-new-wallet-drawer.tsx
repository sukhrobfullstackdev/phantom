import React from 'react';
import { Flex, Spacer, Typography } from '@magiclabs/ui';
import { AngleDown } from '~/shared/svg/magic-connect';
import { DrawerOverlay } from '../drawer-overlay';
import { Button, ButtonSize, ButtonVariant } from '../button';
import { NewWalletDrawerItem } from '../create-new-wallet-drawer-item';
import styles from './create-new-wallet-drawer.less';

export const CreateNewWalletDrawer = ({ wallet, isDrawerOpen, setIsDrawerOpen, handleOpenDrawer }) => {
  return (
    <DrawerOverlay openFrom="bottom" isDrawerOpen={isDrawerOpen} setIsDrawerOpen={setIsDrawerOpen}>
      <div className={styles.drawerContainer}>
        <Flex.Row alignItems="center" justifyContent="space-between">
          <Typography.BodyMedium weight="700">Create new wallet</Typography.BodyMedium>
          <Button
            onClick={handleOpenDrawer}
            size={ButtonSize.small}
            variant={ButtonVariant.subtle}
            iconType={AngleDown}
          />
        </Flex.Row>
        <Spacer size={4} orientation="vertical" />
        <div>
          <NewWalletDrawerItem walletType="email" setIsDrawerOpen={setIsDrawerOpen} />
          <NewWalletDrawerItem walletType={wallet} setIsDrawerOpen={setIsDrawerOpen} />
        </div>
      </div>
    </DrawerOverlay>
  );
};
