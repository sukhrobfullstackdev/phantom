import { Icon, Spacer, TextButton, Typography, useTheme } from '@magiclabs/ui';
import React from 'react';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { MAGIC_WALLET_DAPP_REFERRER } from '~/shared/constants/env';
import { BasePage } from '~/features/connect-with-ui/components/base-page/base-page';
import { ExternalLink, SecurityIcon } from '~/shared/svg/magic-connect';
import { BackActionButton, CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { Network } from '~/features/connect-with-ui/components/network';
import { TrackingButton } from '~/features/connect-with-ui/components/tracking-button';
import { eventData } from '~/features/connect-with-ui/utils/get-login-method';
import { secretPhraseOrPrivateKeyLabel } from '~/features/connect-with-ui/utils/secret-phrase-or-private-key';
import { AnalyticsActionType } from '~/app/libs/analytics';
import styles from './wallet-export-redirect-page.less';

export const WalletExportRedirectPage = () => {
  const { navigateTo } = useControllerContext();
  const theme = useTheme();
  const keyTypeLabel = secretPhraseOrPrivateKeyLabel();

  const MagicWalletDappLink = () => {
    return (
      <TrackingButton actionName={AnalyticsActionType.RevealSecretPhraseRedirectClicked}>
        <TextButton size="sm" color="primary">
          <a
            href={`${MAGIC_WALLET_DAPP_REFERRER}`}
            target="_blank"
            rel="noreferrer"
            className={styles.magicWalletAppLink}
          >
            Magic Wallet App
          </a>
          &nbsp;
          <Icon type={ExternalLink} color={theme.hex.primary.base} size={12} />
        </TextButton>
      </TrackingButton>
    );
  };

  return (
    <>
      <ModalHeader
        leftAction={<BackActionButton onClick={() => navigateTo('wallet-account-info', eventData)} />}
        rightAction={<CancelActionButton />}
        header={<Network />}
      />
      <BasePage>
        <Spacer size={10} orientation="vertical" />
        <Icon type={SecurityIcon} size={100} />
        <Typography.H4 className={styles.header}>For your security</Typography.H4>
        <Spacer size={10} orientation="vertical" />
        <Typography.BodyMedium weight="400" className={styles.text}>
          Login via <MagicWalletDappLink /> to access your wallet {keyTypeLabel}.
        </Typography.BodyMedium>
      </BasePage>
    </>
  );
};
