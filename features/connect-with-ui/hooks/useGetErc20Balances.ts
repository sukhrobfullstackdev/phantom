import useSWR from 'swr';
import { Alchemy } from 'alchemy-sdk';
import { useContext } from 'react';
import { store } from '~/app/store';
import { MultiChainInfoContext } from './multiChainContext';
import { isETHWalletType, isFlowWalletType } from '~/app/libs/network';
import { ALCHEMY_KEYS } from '~/shared/constants/env';
import { ALCHEMY_NETWORKS } from '~/app/constants/alchemy-networks';
import { getLogger } from '~/app/libs/datadog';
import { buildMessageContext } from '~/app/libs/analytics-datadog-helpers';
import { isMobileSDK } from '~/app/libs/platform';

export interface TokenBalances {
  balance: string;
  contractAddress: string;
  decimals: number;
  logo: undefined | string;
  name: string;
  rawBalance: string;
  symbol: string;
  isFlowUsdc?: boolean;
}
export interface GetTokensForOwnerResponse {
  pageKey?: string | undefined;
  tokens: TokenBalances[];
}

const fetcher = async (userAddress, networkName): Promise<TokenBalances[]> => {
  const alchemyInstance = new Alchemy({
    apiKey: ALCHEMY_KEYS[networkName],
    network: ALCHEMY_NETWORKS[networkName],
  });
  // @ts-ignore
  const tokens: GetTokensForOwnerResponse = await alchemyInstance.core.getTokensForOwner(userAddress);
  return tokens.tokens.filter(token => token.rawBalance !== '0');
};

const fetchEvmErc20Tokens = (address: string) => {
  const chainInfo = useContext(MultiChainInfoContext);
  const networkName = chainInfo?.networkName;
  if (!networkName || !address || !isETHWalletType()) return [];
  const { data, error } = useSWR([address, networkName], fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 30000, // refetch data every 30 seconds
  });
  if (error) {
    getLogger().error(`Error fetching ERC20 token balances`, buildMessageContext(error));
  }
  return data || [];
};

export function useGetErc20Balances(): TokenBalances[] | [] {
  // No concept of localstorage on mobile, which we need to 'cache' the data about the token contract (decimals & symbol)
  // Otherwise we're making 3 API calls PER token every 30 seconds
  if (isMobileSDK()) return [];
  const address = store.hooks.useSelector(state => state.Auth.userKeys.publicAddress);
  if (isFlowWalletType()) {
    return [];
  }
  return fetchEvmErc20Tokens(address as string);
}
