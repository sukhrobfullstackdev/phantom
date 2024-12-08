import React from 'react';
import { Flex, Icon, Spacer, Typography } from '@magiclabs/ui';
import { ChevronRight } from '~/shared/svg/magic-connect';
import styles from './fiat-onramp-selection-item.less';
import { TrackingButton } from '../tracking-button';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { NavigationCard } from '../navigation-card';

export const FiatOnrampSelectionItem = ({ event, title, onClick, paymentTypeIcon, label, isDisabled }) => {
  const theme = useTheme();
  return (
    <>
      <NavigationCard onClick={onClick} isDisabled={isDisabled}>
        <TrackingButton actionName={event}>
          <Flex.Row justifyContent="space-between" alignItems="center" onClick={onClick}>
            <Flex.Row alignItems="center">
              <Icon type={paymentTypeIcon} color={theme.theme.hex.primary.base} />
              <Spacer size={15} orientation="horizontal" />
              <div>
                <Typography.BodyMedium className={styles.title} weight="500">
                  {title}
                </Typography.BodyMedium>
              </div>
            </Flex.Row>
            <Flex.Row alignItems="center">
              {label ? (
                <>
                  <Typography.BodySmall weight="400" className={styles.label}>
                    {label}
                  </Typography.BodySmall>
                  <Spacer size={18} orientation="horizontal" />
                </>
              ) : null}
              <Icon type={ChevronRight} color="#B6B4BA" />
            </Flex.Row>
          </Flex.Row>
        </TrackingButton>
      </NavigationCard>
      <Spacer size={10} orientation="vertical" />
    </>
  );
};
