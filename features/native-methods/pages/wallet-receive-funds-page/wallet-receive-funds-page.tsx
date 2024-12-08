import { CallToAction, Spacer, MonochromeIcons } from '@magiclabs/ui';
import React, { useEffect, useState } from 'react';
import { useClipboard } from 'usable-react';
import { QRCode } from 'react-qrcode-logo';
import { store } from '~/app/store';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { CheckmarkIcon } from '~/shared/svg/settings';
import { BasePage } from '~/features/connect-with-ui/components/base-page/base-page';
import { BackActionButton, CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import styles from './wallet-receive-funds-page.less';
import MagicLogo from '~/shared/svg/magic/magic-logo.svg';
import { WalletCompatibilityDisclaimer } from '~/features/connect-with-ui/components/wallet-compatibility-disclaimer';
import { Network } from '~/features/connect-with-ui/components/network';
import { eventData } from '~/features/connect-with-ui/utils/get-login-method';
import { useUIThreadPayload } from '~/app/ui/hooks/ui-thread-hooks';
import { MAGIC_WALLET, MC_WALLET } from '~/app/constants/route-methods';

export const WalletReceiveFundsPage = () => {
  const { navigateTo } = useControllerContext();
  const walletAddress = store.hooks.useSelector(state => state.Auth.userKeys.publicAddress);
  const { copy } = useClipboard();
  const [wasCopied, setWasCopied] = useState(false);
  const payload = useUIThreadPayload();

  useEffect(() => {
    if (wasCopied) {
      const timeout = setTimeout(() => setWasCopied(false), 1000);
      return () => clearTimeout(timeout);
    }
  }, [wasCopied]);

  useEffect(() => {
    const copyButton = document.querySelector('#copyButton')?.lastChild;
    if (copyButton) {
      (copyButton as HTMLElement).style.width = 'fit-content';
    }
  }, []);

  const copyAddress = () => {
    setWasCopied(true);
    copy(walletAddress);
  };

  const isWalletUiRpcMethod = payload?.method === MAGIC_WALLET || payload?.method === MC_WALLET;

  return (
    <>
      <ModalHeader
        leftAction={
          isWalletUiRpcMethod ? <BackActionButton onClick={() => navigateTo('wallet-home', eventData)} /> : <div />
        }
        rightAction={<CancelActionButton />}
        header={<Network />}
      />
      <BasePage>
        <Spacer size={24} orientation="vertical" />
        <div className={styles.qrCodeContainer}>
          <QRCode
            value={walletAddress}
            size={160}
            logoImage={MagicLogo}
            logoHeight={32}
            logoWidth={28}
            removeQrCodeBehindLogo
            qrStyle="dots"
          />
        </div>
        <Spacer size={24} orientation="vertical" />
        <CallToAction
          id="copyButton"
          color="primary"
          className={styles.copyButton}
          onClick={copyAddress}
          leadingIcon={wasCopied ? CheckmarkIcon : MonochromeIcons.Copy}
        >
          {wasCopied ? 'Copied!' : 'Copy Address'}
        </CallToAction>
        <Spacer size={32} orientation="vertical" />
        <WalletCompatibilityDisclaimer />
      </BasePage>
    </>
  );
};
