import React, { useContext } from 'react';
import { useTabs, Spacer, MonochromeIcons } from '@magiclabs/ui';
import styles from './wallet-home-page.less';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { HomePageActions } from './home-page-action';
import { store } from '~/app/store';
import { WalletAddress } from '~/features/native-methods/pages/wallet-account-info-page';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { Button, ButtonSize, ButtonVariant } from '~/features/connect-with-ui/components/button';
import { CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { Network } from '~/features/connect-with-ui/components/network';
import { TokenList } from '~/features/connect-with-ui/components/token-list';
import { CollectiblesList } from '~/features/connect-with-ui/components/collectibles-list';
import { BalanceInUsd } from '~/features/connect-with-ui/components/balance-in-usd';
import { eventData } from '~/features/connect-with-ui/utils/get-login-method';
import { isETHWalletType } from '~/app/libs/network';
import { MultiChainInfoContext } from '~/features/connect-with-ui/hooks/multiChainContext';
import { FaucetBanner } from '~/features/connect-with-ui/components/faucet-banner';
import { useGetNativeTokenBalance } from '~/features/connect-with-ui/hooks/useGetNativeTokenBalance';
import { isWindows } from '~/app/libs/platform';
import { isChromeAgent } from '~/features/connect-with-ui/utils/get-user-agent';

interface WalletHomePageProps {
  isNftViewerEnabled: boolean;
  isFiatOnRampEnabled: boolean;
  isSendFundsEnabled: boolean;
}

export const WalletHomePage = ({
  isNftViewerEnabled,
  isFiatOnRampEnabled,
  isSendFundsEnabled,
}: WalletHomePageProps) => {
  const { navigateTo } = useControllerContext();
  const chainInfo = useContext(MultiChainInfoContext);
  const balance = useGetNativeTokenBalance();
  const profilePictureUrl = store.hooks.useSelector(state => state.User.profilePictureUrl);
  const isShowEthFeature = isETHWalletType();

  return (
    <div>
      <ModalHeader
        leftAction={
          profilePictureUrl ? (
            <div
              role="button"
              tabIndex={0}
              onClick={() => navigateTo('wallet-account-info', eventData)}
              onKeyPress={() => navigateTo('wallet-account-info', eventData)}
              className={styles.profilePicture}
            >
              <img alt="profile" height="32px" referrerPolicy="no-referrer" src={profilePictureUrl} />
            </div>
          ) : (
            <Button
              iconType={MonochromeIcons.Profile}
              size={ButtonSize.small}
              variant={ButtonVariant.secondary}
              onClick={() => navigateTo('wallet-account-info', eventData)}
            />
          )
        }
        rightAction={<CancelActionButton />}
        header={<Network />}
      />
      {!chainInfo?.isMainnet && balance === '0x0' ? (
        <>
          <Spacer size={16} orientation="vertical" className={styles.faucetBannerPadding} />
          <FaucetBanner />
        </>
      ) : null}
      <div className={`${styles.walletHomePage} ${isWindows() && isChromeAgent ? styles.customScrollBar : ''}`}>
        <Spacer size={24} orientation="vertical" />
        <BalanceInUsd />
        <Spacer size={4} orientation="vertical" />
        <WalletAddress />
        <Spacer size={28} orientation="vertical" />
        <HomePageActions isFiatOnRampEnabled={isFiatOnRampEnabled} isSendFundsEnabled={isSendFundsEnabled} />
        <div className={styles.tabs}>
          <Tabs show={isNftViewerEnabled && isShowEthFeature} />
          {!isShowEthFeature && (
            <>
              <Spacer size={15} orientation="vertical" />
              <TokenList />
            </>
          )}
          <NftTokenList show={!isNftViewerEnabled && isShowEthFeature} />
        </div>
      </div>
    </div>
  );
};

const Tabs = ({ show }: { show: boolean }) => {
  const { tablist, tabpanel } = useTabs({
    id: 'horizontal-tabs',
    label: 'Horizontal Tabs',
    size: 'sm',

    tabs: [
      { id: 'one', label: 'Collectibles', content: <CollectiblesList /> },
      { id: 'two', label: 'Tokens', content: <TokenList /> },
    ],
  });

  return show ? (
    <>
      <div className={styles.tabListContainer}>{tablist}</div>
      <div>{tabpanel}</div>
    </>
  ) : null;
};

const NftTokenList = ({ show }: { show: boolean }) =>
  show ? (
    <>
      <Spacer size={15} orientation="vertical" />
      <TokenList />
    </>
  ) : null;
