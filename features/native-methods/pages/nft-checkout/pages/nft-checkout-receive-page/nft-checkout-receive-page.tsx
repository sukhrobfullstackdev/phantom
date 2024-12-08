import React, { useState } from 'react';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { useThemeMode } from '~/features/native-methods/hooks/useThemeMode';
import { useUserMetadata } from '~/features/native-methods/hooks/useUserMetadata';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { BackActionButton, CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { Flex, Spacer, Typography } from '@magiclabs/ui';
import MagicLogo from '~/shared/svg/magic/magic-logo.svg';
import { QRCode } from 'react-qrcode-logo';
import styles from './nft-checkout-receive-page.less';
import { Button } from '~/features/native-methods/ui/button/button';
import { useChainInfo } from '~/features/blockchain-ui-methods/hooks/use-chain-info';
import { CopyIcon } from '~/features/native-methods/ui/icons/copy-icon';
import { useClipboard } from 'usable-react';
import { CheckIcon } from '~/features/native-methods/ui/icons/CheckIcon';
import { i18n } from '~/app/libs/i18n';
import { MotionContainer } from '~/features/native-methods/components/motion-container/motion-container';

export const NFTCheckoutReceivePage = () => {
  const { mode } = useThemeMode();
  const { address } = useUserMetadata();
  const { chainInfo } = useChainInfo();
  const { navigateBackToPrevPage } = useControllerContext();
  const { copy } = useClipboard();
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyAddress = () => {
    copy(address);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <>
      <ModalHeader
        leftAction={<BackActionButton onClick={navigateBackToPrevPage} />}
        rightAction={<CancelActionButton />}
        title="Receive Funds"
        header={
          <Flex direction="column" alignItems="center">
            <Typography.BodySmall weight="400" color="var(--ink70)">
              Receive Funds
            </Typography.BodySmall>
          </Flex>
        }
      />
      <MotionContainer style={{ alignItems: 'center' }}>
        <Spacer size={44} orientation="vertical" />
        <div className={styles.qrCodeContainer}>
          <QRCode
            value={address}
            size={160}
            logoImage={MagicLogo}
            logoHeight={32}
            logoWidth={28}
            removeQrCodeBehindLogo
            qrStyle="dots"
          />
        </div>

        <Spacer size={24} orientation="vertical" />

        <Button variant="neutral" style={{ width: 'fit-content' }} onClick={handleCopyAddress}>
          {isCopied ? (
            <CheckIcon
              color="#18171A"
              style={{
                filter: `invert(${mode('0%', '100%')})`,
              }}
            />
          ) : (
            <CopyIcon
              style={{
                filter: `invert(${mode('0%', '100%')})`,
              }}
            />
          )}{' '}
          {isCopied ? 'Copied!' : 'Copy address'}
        </Button>

        <Spacer size={16} orientation="vertical" />

        <Typography.BodySmall color={mode('var(--ink70)', 'var(--chalk72)')}>
          {i18n.nft_checkout.make_sure_your_network.toMarkdown({
            networkName: chainInfo.networkName,
          })}
        </Typography.BodySmall>
      </MotionContainer>
    </>
  );
};
