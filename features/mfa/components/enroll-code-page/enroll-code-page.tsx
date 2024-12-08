import React, { useEffect, useMemo, useState } from 'react';
import { useAsyncEffect, useClipboard } from 'usable-react';
import { CallToAction, Flex, HoverActivatedTooltip, Icon, Spacer } from '@magiclabs/ui';
import { i18n } from '~/app/libs/i18n';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import styles from './enroll-code-page.less';
import { QRCode } from '../../qrcode';
import { BackActionButton, CancelActionButton } from '~/app/ui/components/widgets/modal-action-button/';
import { useEnrollMfa } from '../../hooks/mfaHooks';
import { CopyIcon } from '~/shared/svg/magic-connect';
import { LoadingSpinner } from '~/app/ui/components/widgets/loading-spinner';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';

export const EnrollCodePage = ({ returnToRoute }) => {
  const { navigateTo } = useControllerContext();
  const { theme } = useTheme();
  const { startMfaEnroll, isLoading, mfaSecret } = useEnrollMfa();
  const qrCodeElmId = 'qr-code';

  useAsyncEffect(async () => {
    if (!mfaSecret) {
      await startMfaEnroll();
    }
  }, []);

  useEffect(() => {
    if (!mfaSecret || !theme.appName) {
      return;
    }
    // eslint-disable-next-line no-new
    new QRCode(qrCodeElmId, {
      text: generateOtpauthUrl(theme.appName, mfaSecret),
      width: 120,
      height: 120,
    });
  }, [mfaSecret, theme.appName]);

  const displaySecret = useMemo(() => mfaSecret?.replaceAll(/(....)(?=.)/g, '$1 '), [mfaSecret]);

  if (isLoading) {
    return (
      <div className={styles.enrollCodePage}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <ModalHeader
        leftAction={<BackActionButton onClick={() => navigateTo('mfa-prompt-authenticator')} />}
        rightAction={!returnToRoute ? <CancelActionButton /> : null}
      />
      <div className={styles.enrollCodePage}>
        <div className={styles.qrCodeContainer} id={qrCodeElmId} />
        <Spacer size={24} orientation="vertical" />
        <h1 className={styles.title}>{i18n.mfa.scan_qr_code_title.toString()}</h1>
        <Spacer size={8} orientation="vertical" />
        <div className={styles.body}>{i18n.mfa.scan_qr_code_body.toString()}</div>
        <Spacer size={24} orientation="vertical" />
        <Flex.Row>
          <div className={styles.keyLabel}>{i18n.mfa.key.toString()}</div>
          <div className={styles.secret}>{displaySecret}</div>
          <Spacer size={15} />
          <CopyContentButton toCopy={mfaSecret} />
        </Flex.Row>
        <Spacer size={40} orientation="vertical" />
        <CallToAction onClick={() => navigateTo('mfa-enter-totp')}>{i18n.mfa.next.toString()}</CallToAction>
      </div>
    </>
  );
};

const generateOtpauthUrl = (appName: string, secret: string) => {
  return `otpauth://totp/${encodeURIComponent(appName)}?secret=${secret}`;
};

const CopyContentButton = ({ toCopy }) => {
  const [labelContent, setLabelContent] = useState(i18n.mfa.copy.toString());
  const { copy } = useClipboard();
  const { theme } = useTheme();

  const copySecretToClipboard = () => {
    copy(toCopy);
    setLabelContent(i18n.mfa.copied.toString());
    setTimeout(() => setLabelContent(i18n.mfa.copy.toString()), 1200);
  };

  return (
    <HoverActivatedTooltip placement="top">
      <HoverActivatedTooltip.Anchor>
        <Icon
          onClick={copySecretToClipboard}
          className={styles.copyButton}
          type={CopyIcon}
          color={theme.color.primary.base.toString()}
        />
      </HoverActivatedTooltip.Anchor>
      <HoverActivatedTooltip.Content>{labelContent}</HoverActivatedTooltip.Content>
    </HoverActivatedTooltip>
  );
};
