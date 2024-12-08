import React from 'react';
import { LedgerNetworks } from '~/features/connect-with-ui/hooks/multiChainContext';
import { Flex, Icon } from '@magiclabs/ui';
import { SuccessCheckmark } from '~/shared/svg/magic-connect';
import styles from '~/features/connect-with-ui/components/network/network-switcher.less';
import { store } from '~/app/store';

const networkOptions = [
  { name: 'Ethereum', config: LedgerNetworks.ETH[1] }, // ethereum mainnet
  { name: 'Polygon', config: LedgerNetworks.ETH[137] }, // polygon mainnet
  { name: 'Optimism', config: LedgerNetworks.ETH[10] }, // optimism mainnet
  { name: 'Flow', config: LedgerNetworks.FLOW.mainnet }, // flow mainnet
  { name: 'Base', config: LedgerNetworks.ETH[8453] }, // base mainnet
  { name: 'Arbitrum', config: LedgerNetworks.ETH[42161] }, // arbitrum mainnet
];

const getBaseUrl = () => {
  // this is the client app's origin of the most recent json rpc request event.
  // see setEventOrigin in json-rpc-channel.ts
  const { System } = store.getState();
  const clientAppDomain = System.eventOrigin;
  if (clientAppDomain.includes('wallet.magic.link')) return 'https://wallet.magic.link';
  if (clientAppDomain.includes('wallet.stagef.magic.link')) return 'https://wallet.stagef.magic.link';
  if (clientAppDomain.includes('localhost:3006')) return 'http://localhost:3006';
  return 'https://wallet.magic.link';
};

const constructUrl = (networkName: string) => `${getBaseUrl()}?network=${networkName}`;

interface NetworkSwitcherProps {
  selectedNetwork: string | undefined;
}

const NetworkSwitcher: React.FC<NetworkSwitcherProps> = ({ selectedNetwork }) => (
  <Flex.Column className={styles.container}>
    {networkOptions.map(networkOption => {
      const newtworkName = networkOption.name.toLowerCase();
      const isSelected = selectedNetwork === networkOption.config.networkName;
      return (
        <a className={styles.link} href={constructUrl(newtworkName)} key={networkOption.name} target="_top">
          <Icon aria-hidden type={networkOption.config.blockchainIcon} size={16} />
          <div>{networkOption.name}</div>
          {isSelected && <Icon type={SuccessCheckmark} size={16} style={{ marginLeft: 'auto' }} />}
        </a>
      );
    })}
  </Flex.Column>
);

export default NetworkSwitcher;
