import React, { useContext } from 'react';
import { Alert, Flex, Icon, Typography } from '@magiclabs/ui';
import { TokenFormatter } from '../token-formatter';
import { CurrencyFormatter } from '../currency-formatter';
import { ChevronRight, ExternalLink } from '~/shared/svg/magic-connect';
import { MultiChainInfoContext } from '~/features/connect-with-ui/hooks/multiChainContext';
import LedgerBalance from '~/app/libs/ledger-balance';
import { eventData } from '~/features/connect-with-ui/utils/get-login-method';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import styles from './insufficient-funds-alert.less';
import { store } from '~/app/store';

export const InsufficientFundsAlert = ({ balance, total, price }) => {
  const chainInfo = useContext(MultiChainInfoContext);
  const { navigateTo } = useControllerContext();
  const ledgerBalance = new LedgerBalance();
  const { LAUNCH_DARKLY_FEATURE_FLAGS, CLIENT_FEATURE_FLAGS } = store.hooks.useSelector(state => {
    return state.System;
  });
  const isFiatOnRampEnabled =
    LAUNCH_DARKLY_FEATURE_FLAGS['is-fiat-on-ramp-enabled'] && CLIENT_FEATURE_FLAGS.is_fiat_onramp_enabled;

  return chainInfo?.isMainnet ? (
    <div className={styles.alert}>
      <Alert type="warning" icon={false}>
        <button
          style={{
            border: 'none',
            background: 'transparent',
            textAlign: 'left',
            padding: '0px',
            opacity: isFiatOnRampEnabled ? '1' : '0.6',
            cursor: isFiatOnRampEnabled ? 'pointer' : 'not-allowed',
          }}
          tabIndex={0}
          disabled={!isFiatOnRampEnabled}
          onClick={() => navigateTo('wallet-fiat-onramp-selection', eventData)}
        >
          <Flex.Row alignItems="center">
            <div>
              <Typography.BodySmall weight="400" color="var(--gold90)">
                Please add at least{' '}
                <strong>
                  <TokenFormatter
                    value={ledgerBalance.balanceNeededToCoverTransaction(total, balance)}
                    token={chainInfo?.currency}
                  />
                </strong>{' '}
                (<CurrencyFormatter value={ledgerBalance.fiatNeededToCoverTransaction(total, balance, price)} />) to
                continue.
              </Typography.BodySmall>
            </div>
            {isFiatOnRampEnabled && (
              <div style={{ marginLeft: '10px' }}>
                <Icon type={ChevronRight} />
              </div>
            )}
          </Flex.Row>
        </button>
      </Alert>
    </div>
  ) : chainInfo?.faucetUrl ? (
    <a href={chainInfo?.faucetUrl} target="_blank" rel="noreferrer" className={styles.alert}>
      <Alert type="warning" icon={false}>
        <Flex.Row alignItems="center" justifyContent="space-between">
          <Typography.BodySmall weight="400">
            Insufficient Funds. <strong>Visit {chainInfo?.networkName} faucet</strong>
          </Typography.BodySmall>
          <Icon type={ExternalLink} color="var(--gold90)" />
        </Flex.Row>
      </Alert>
    </a>
  ) : (
    <Alert type="warning" icon={false}>
      <Flex.Row alignItems="center" justifyContent="space-between">
        <Typography.BodySmall weight="400">Insufficient Funds.</Typography.BodySmall>
      </Flex.Row>
    </Alert>
  );
};
