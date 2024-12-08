import { HoverActivatedTooltip, Typography } from '@magiclabs/ui';
import React from 'react';
import { Address } from '../address';
import styles from './tooltip-address.less';

export const TooltipAddress = ({ address, chainInfoUri }) => {
  return (
    <HoverActivatedTooltip placement="top">
      <HoverActivatedTooltip.Anchor>
        <a href={`${chainInfoUri}/${address}`} rel="noreferrer" target="_blank" className={styles.addressLink}>
          <Address address={address} />
        </a>
      </HoverActivatedTooltip.Anchor>
      <HoverActivatedTooltip.Content style={{ width: '140px' }}>
        <Typography.BodySmall weight="400" className={styles.addressTooltip}>
          View Address Details
        </Typography.BodySmall>
      </HoverActivatedTooltip.Content>
    </HoverActivatedTooltip>
  );
};
