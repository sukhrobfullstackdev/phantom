import React, { useContext } from 'react';
import styles from './faucet-banner.less';
import { Flex, Icon, Typography } from '@magiclabs/ui';
import { ExternalLink } from '~/shared/svg/magic-connect';
import { MultiChainInfoContext } from '../../hooks/multiChainContext';

export const FaucetBanner = () => {
  const chainInfo = useContext(MultiChainInfoContext);
  // eslint-disable-next-line react/destructuring-assignment
  return chainInfo && !chainInfo.isMainnet ? (
    // eslint-disable-next-line react/destructuring-assignment
    <a href={chainInfo.faucetUrl} target="_blank" rel="noreferrer" className={styles.link}>
      <Flex.Row className={styles.banner} alignItems="center" justifyContent="space-between">
        <Typography.BodySmall color="var(--magicBg)">
          {/* eslint-disable-next-line react/destructuring-assignment */}
          Visit {chainInfo.networkName} faucet
        </Typography.BodySmall>
        <Icon type={ExternalLink} size={14} color="var(--magicBg)" />
      </Flex.Row>
    </a>
  ) : null;
};
