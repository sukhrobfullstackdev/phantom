import React, { useContext } from 'react';
import { Flex, Icon, Spacer, Typography } from '@magiclabs/ui';
import { ExternalLink } from '~/shared/svg/magic-connect';
import { MultiChainInfoContext } from '~/features/connect-with-ui//hooks/multiChainContext';
import styles from './on-ramp-unavailable-banner.less';

export const OnRampUnavailableBanner = () => {
  const chainInfo = useContext(MultiChainInfoContext);
  // eslint-disable-next-line react/destructuring-assignment
  return chainInfo && !chainInfo.isMainnet ? (
    <a
      href="https://magic.link/docs/connect/features/fiat-on-ramps"
      target="_blank"
      rel="noreferrer"
      className={styles.link}
    >
      <Flex.Row className={styles.banner} alignItems="center" justifyContent="space-between">
        <Typography.BodySmall weight="400" color="var(--gold90)">
          On-ramps unavailable on testnets
        </Typography.BodySmall>
        <Flex.Row alignItems="center">
          <Typography.BodySmall color="var(--gold90)">Learn more</Typography.BodySmall>
          <Spacer size={5} orientation="horizontal" />
          <Icon type={ExternalLink} color="var(--gold90)" />
        </Flex.Row>
      </Flex.Row>
    </a>
  ) : null;
};
