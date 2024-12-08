import { Icon, Spacer, Typography } from '@magiclabs/ui';
import React from 'react';
import { ERC20TokenIcon } from '~/shared/svg/magic-connect';
import { TokenFormatter } from '../token-formatter';
import styles from './wallet-amount-available.less';

export const FlowUsdAmountAvailable = ({ logo, balance, symbol }) => {
  return (
    <div className={styles.toolTip}>
      <div className={styles.amount}>
        {logo ? (
          <img src={logo} height={24} width={24} alt={`${symbol} logo`} style={{ borderRadius: '50%' }} />
        ) : (
          <Icon color="7343DC" size={24} type={ERC20TokenIcon} />
        )}
        <Spacer size={8} orientation="horizontal" />
        <TokenFormatter value={Number(balance)} token={symbol} />
        <Typography.BodySmall weight="400" style={{ paddingLeft: '3px' }}>
          available
        </Typography.BodySmall>
      </div>
    </div>
  );
};
