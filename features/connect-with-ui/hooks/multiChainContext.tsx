import { Flex, MonochromeIconDefinition } from '@magiclabs/ui';
import React, { createContext, useEffect, useState } from 'react';
import { knownRpcUrlToChainId } from '~/app/constants/url-to-chain-id-map';
import { getETHNetworkUrl, getNetworkName, getWalletType, isETHWalletType } from '~/app/libs/network';
import { getChainId } from '~/app/services/web3/eth-methods';
import { store } from '~/app/store';
import { LoadingSpinner } from '~/app/ui/components/widgets/loading-spinner';
import { setChainId } from '~/app/store/auth/auth.actions';
import { Flow } from '~/shared/svg/magic-connect';
import { networksByChainId } from '~/features/connect-with-ui/hooks/chainInfoContext';
import { useUIThreadPayload } from '~/app/ui/hooks/ui-thread-hooks';
import { sdkErrorFactories } from '~/app/libs/exceptions';
import { rejectPayload } from '~/app/rpc/utils';
import { PendingSpinner } from '~/features/native-methods/ui/PendingSpinner';
import { useHistory } from 'react-router-dom';
import { Endpoint } from '~/server/routes/endpoint';
import { getOptionsFromEndpoint } from '~/app/libs/query-params';

export interface IMultiChainInfo {
  chainId: number;
  currency: string;
  onramperCurrency: string;
  name: string;
  network: string;
  isMainnet: boolean;
  networkName: string;
  tokenCompatibility: string;
  blockExplorer: string;
  tokenIcon: MonochromeIconDefinition;
  blockchainIcon: MonochromeIconDefinition;
  faucetUrl?: string;
}

export const MultiChainInfoContext = createContext<null | IMultiChainInfo>(null);

export const LedgerNetworks = {
  FLOW: {
    mainnet: {
      chainId: 1,
      network: 'FLOW',
      isMainnet: true,
      networkName: 'Flow',
      name: 'Flow',
      currency: 'FLOW',
      onramperCurrency: 'FLOW',
      tokenCompatibility: 'FUSD',
      blockExplorer: 'https://www.flowdiver.io',
      tokenIcon: Flow,
      blockchainIcon: Flow,
    } as IMultiChainInfo,
    testnet: {
      chainId: 2,
      network: 'FLOW',
      isMainnet: false,
      networkName: 'Flow Testnet',
      name: 'Flow',
      currency: 'FLOW',
      onramperCurrency: 'FLOW',
      tokenCompatibility: 'FUSD',
      blockExplorer: 'https://testnet.flowdiver.io',
      tokenIcon: Flow,
      blockchainIcon: Flow,
      faucetUrl: 'https://testnet-faucet.onflow.org/fund-account',
    } as IMultiChainInfo,
  },
  ETH: networksByChainId,
};

export const MultiChainInfo = ({ children }) => {
  const payload = useUIThreadPayload();
  const walletAddress = store.hooks.useSelector(state => state.Auth.userKeys.publicAddress);
  const [chainInfo, setChainInfo] = useState(null);

  const fetchChainId = async EVMChainData => {
    const chainId = await getChainId();
    const verifiedChainInfo = EVMChainData[Number(chainId || 1)];
    if (!verifiedChainInfo) {
      if (payload) {
        return rejectPayload(payload, sdkErrorFactories.web3.unsupportedBlockchain());
      }
    }
    return verifiedChainInfo.chainId.toString();
  };

  const verifyEVMChainInfo = EVMChainInfo => {
    const nodeUrl = getETHNetworkUrl();
    if (nodeUrl) {
      const baseUrl = nodeUrl.split('/')[2];
      if (knownRpcUrlToChainId[baseUrl]) {
        return EVMChainInfo[knownRpcUrlToChainId[baseUrl]];
      }
    }
  };

  const filterChainInfo = async walletType => {
    const chainData = LedgerNetworks[walletType];
    const networkName = getNetworkName();

    if (isETHWalletType()) {
      const verifiedEVMChainInfo = verifyEVMChainInfo(chainData);
      if (!verifiedEVMChainInfo) {
        const evmChainID = await fetchChainId(chainData);
        store.dispatch(setChainId(evmChainID));
        setChainInfo(chainData[evmChainID]);
      } else {
        setChainInfo(verifiedEVMChainInfo);
      }
    } else if (!chainData) {
      setChainInfo(null);
    } else {
      setChainInfo(networkName.toLocaleLowerCase() === 'mainnet' ? chainData.mainnet : chainData.testnet);
    }
  };

  useEffect(() => {
    const walletType = getWalletType();
    filterChainInfo(walletType).catch(console.error);
  }, [walletAddress]);

  return (
    <MultiChainInfoContext.Provider value={chainInfo}>
      {chainInfo ? children : <PendingSpinner />}
    </MultiChainInfoContext.Provider>
  );
};
