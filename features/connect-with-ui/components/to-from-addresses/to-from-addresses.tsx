import { Flex, Icon, MonochromeIcons, Skeleton, Spacer } from '@magiclabs/ui';
import React, { useContext } from 'react';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { TooltipAddress } from '../tooltip-address';
import { MultiChainInfoContext } from '../../hooks/multiChainContext';
import { isETHWalletType } from '~/app/libs/network';

export const ToFromAddresses = ({ to, from, chainInfoUriOverride = '' }) => {
  const chainInfo = useContext(MultiChainInfoContext);
  const chainInfoUri =
    chainInfoUriOverride || `${chainInfo?.blockExplorer}/${isETHWalletType() ? 'address' : 'account'}`;

  const theme = useTheme();
  return (
    <Flex.Row alignItems="center" justifyContent="center" style={{ fontVariant: 'no-contextual' }}>
      <TooltipAddress address={from} chainInfoUri={chainInfoUri} />
      <Spacer size={10} orientation="horizontal" />
      <Icon size={15} type={MonochromeIcons.ArrowRight} color={theme.theme.color.mid.lighter.toString()} />
      <Spacer size={10} orientation="horizontal" />
      {to && <TooltipAddress address={to} chainInfoUri={chainInfoUri} />}
      {to === undefined && <Skeleton shape="pill" height="17px" width="101px" />}
    </Flex.Row>
  );
};
