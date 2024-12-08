import { Icon } from '@magiclabs/ui';
import React, { useContext } from 'react';
import { Ethereum, Polygon, Flow } from '~/shared/svg/magic-connect';
import { MultiChainInfoContext } from '~/features/connect-with-ui/hooks/multiChainContext';

const TokenNameToLogoOverride = {
  ETH: Ethereum,
  MATIC: Polygon,
  FLOW: Flow,
};

/**
 * The `confirm-action` tab doesn't have access to the node url to accurately determine the `chainInfo`,
 * so we'll generate it based off the `token: chainInfo?.currency` value inside the JWT, which is the
 * `tokenOverride` value.
 */
export const NativeTokenLogo = ({ tokenOverride = '', size = 30 }) => {
  const chainInfo = useContext(MultiChainInfoContext);
  return <Icon size={size} type={TokenNameToLogoOverride[tokenOverride] || chainInfo?.tokenIcon || Ethereum} />;
};
