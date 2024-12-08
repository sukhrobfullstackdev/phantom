import { Spacer } from '@magiclabs/ui';
import React, { useMemo } from 'react';
import { TokenBalances, useGetErc20Balances } from '~/features/connect-with-ui/hooks/useGetErc20Balances';
import { NativeTokenListItemOverload } from '../native-token-list-item';
import { TokenListItemOverload } from '../token-list-item';
import styles from './token-list.less';

export const TokenList = ({ isTokenSelectionPage }) => {
  const tokenBalances: TokenBalances[] = useGetErc20Balances();
  const sortedTokenBalances = useMemo(() => {
    return tokenBalances.sort(compare);
  }, [tokenBalances]);

  // Sort tokens with logos first
  function compare(a, b) {
    if (a.logo) {
      return -1;
    }
    if (b.logo) {
      return 1;
    }
    return 0;
  }

  return (
    <div className={isTokenSelectionPage ? styles.tokenSelectionPageTokenList : styles.tokenList}>
      <NativeTokenListItemOverload isTokenSelectionPage={isTokenSelectionPage} />
      {sortedTokenBalances?.map(token => {
        return (
          <div key={token.contractAddress}>
            {isTokenSelectionPage ? <Spacer size={10} orientation="vertical" /> : <hr className={styles.hr} />}
            <TokenListItemOverload
              name={token.name}
              symbol={token.symbol}
              decimals={token.decimals}
              balance={token.rawBalance || '0'}
              contractAddress={token.contractAddress}
              isTokenSelectionPage={isTokenSelectionPage}
              logo={token.logo}
              isSendFlowUsdc={token.isFlowUsdc}
            />
          </div>
        );
      })}
    </div>
  );
};

TokenList.defaultProps = {
  isTokenSelectionPage: false,
};
