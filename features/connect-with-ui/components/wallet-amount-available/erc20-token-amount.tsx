import { Icon, Spacer, Typography } from '@magiclabs/ui';
import React from 'react';
import { ethers } from 'ethers';
import { ERC20TokenIcon } from '~/shared/svg/magic-connect';
import { TokenFormatter } from '../token-formatter';
import styles from './wallet-amount-available.less';
import { ethDecimalsToUnit } from '../../utils/transaction-type-utils';

export const Erc20TokenAmountAvailable = ({ logo, balance, decimals, symbol }) => {
  return (
    <div className={styles.toolTip}>
      <div className={styles.amount}>
        {logo ? (
          <img src={logo} height={24} width={24} alt={`${symbol} logo`} style={{ borderRadius: '50%' }} />
        ) : (
          <Icon color="7343DC" size={24} type={ERC20TokenIcon} />
        )}
        <Spacer size={8} orientation="horizontal" />
        <TokenFormatter
          value={Number(ethers.utils.formatUnits(balance, ethDecimalsToUnit[decimals] || 'ether'))}
          token={symbol}
        />
        <Typography.BodySmall weight="400" style={{ paddingLeft: '3px' }}>
          available
        </Typography.BodySmall>
      </div>
    </div>
  );
};
