import React, { useState } from 'react';
import { CallToAction, Icon, Spacer, TextButton, Typography } from '@magiclabs/ui';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { BasePage } from '~/features/connect-with-ui/components/base-page/base-page';
import { BackActionButton, CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { getLoginMethod } from '~/features/connect-with-ui/utils/get-login-method';
import { TrackingButton } from '~/features/connect-with-ui/components/tracking-button';
import { WarningIcon } from '~/shared/svg/magic-connect';
import { WalletExportAgreementItem } from '~/features/connect-with-ui/components/wallet-export-agreement-item';
import { secretPhraseOrPrivateKeyLabel } from '~/features/connect-with-ui/utils/secret-phrase-or-private-key';
import styles from './wallet-export-agreement-page.less';
import { AnalyticsActionType } from '~/app/libs/analytics';

export const WalletExportAgreementPage = () => {
  const { navigateTo } = useControllerContext();
  const [isCheckboxOneChecked, setIsCheckboxOneChecked] = useState(false);
  const [isCheckboxTwoChecked, setIsCheckboxTwoChecked] = useState(false);
  const keyTypeLabel = secretPhraseOrPrivateKeyLabel();

  return (
    <>
      <ModalHeader
        leftAction={<BackActionButton onClick={() => navigateTo('wallet-account-info', getLoginMethod())} />}
        rightAction={<CancelActionButton />}
      />
      <BasePage>
        <Icon type={WarningIcon} size={100} />
        <Typography.H4 className={styles.header}>Attention</Typography.H4>
        <Spacer size={20} orientation="vertical" />
        <Typography.BodySmall weight="400" className={styles.text}>
          Your {keyTypeLabel} allows you to back up or recover your wallet
        </Typography.BodySmall>
        <Spacer size={30} orientation="vertical" />
        <WalletExportAgreementItem
          isChecked={isCheckboxOneChecked}
          setIsChecked={setIsCheckboxOneChecked}
          content={[
            `I understand sharing the ${keyTypeLabel} with others means sharing `,
            <strong key="full-access">full access</strong>,
            ' to my wallet and assets',
          ]}
        />
        <Spacer size={10} orientation="vertical" />
        <WalletExportAgreementItem
          isChecked={isCheckboxTwoChecked}
          setIsChecked={setIsCheckboxTwoChecked}
          content={`I understand I’m responsible for the security of the ${keyTypeLabel} and that Magic cannot help me recover it if I lose my wallet access`}
        />
        <Spacer size={30} orientation="vertical" />
        <TrackingButton actionName={AnalyticsActionType.RevealSecretPhraseClicked}>
          <CallToAction
            color="primary"
            style={{ width: '100%' }}
            disabled={!isCheckboxOneChecked || !isCheckboxTwoChecked}
            onClick={() => navigateTo('wallet-export', getLoginMethod())}
          >
            Reveal {keyTypeLabel}
          </CallToAction>
        </TrackingButton>
        <Spacer size={15} orientation="vertical" />
        <Typography.BodySmall weight="400" style={{ maxWidth: '200px', margin: 'auto' }}>
          By continuing, you agree to Magic’s{' '}
          <a
            href="https://magic.link/legal/terms-of-service"
            target="_blank"
            rel="noreferrer"
            className={styles.termsOfServiceLink}
          >
            <TextButton size="sm">Terms of Service</TextButton>
          </a>
        </Typography.BodySmall>
      </BasePage>
    </>
  );
};
