import { MonochromeIconDefinition } from '@magiclabs/ui';
import React from 'react';
import { sdkErrorFactories } from '~/app/libs/exceptions';
import { i18n } from '~/app/libs/i18n';
import { isMagicWalletDapp } from '~/app/libs/connect-utils';
import { useCloseUIThread, useUIThreadPayload, useUIThreadResponse } from '~/app/ui/hooks/ui-thread-hooks';
import { ArrowLeft, CloseIcon } from '~/shared/svg/magic-connect';
import { Button, ButtonPropTypes, ButtonSize, ButtonVariant } from '~/features/connect-with-ui/components/button';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { resolvePayload } from '~/app/rpc/utils';
import { isSdkVersionGreaterThanOrEqualTo } from '~/app/libs/is-version-greater-than';
import styles from './modal-action-button.less';
import { isWalletUIRpcMethod } from '~/app/libs/wallet-ui-rpc-methods';
import { includes } from '~/app/libs/lodash-utils';
import { MAGIC_NFT_CHECKOUT, MAGIC_NFT_TRANSFER } from '~/app/constants/route-methods';

export const CancelActionButton = ({ ...rest }) => {
  const cancel = useCloseUIThread(sdkErrorFactories.magic.userRejectAction());
  const payload = useUIThreadPayload();
  const response = useUIThreadResponse();

  const handleCloseButton = () => {
    // Conditional logic against the magic-sdk version to ensure it doesn't interrupt
    // how existing devs may be handling the error
    const VERSION = '14.0.0';
    if (payload && isWalletUIRpcMethod(payload) && isSdkVersionGreaterThanOrEqualTo(VERSION)) {
      return resolvePayload(payload, true);
    }

    if (payload && response && includes([MAGIC_NFT_CHECKOUT, MAGIC_NFT_TRANSFER], payload.method)) {
      return resolvePayload(payload, response);
    }

    cancel();
  };

  return isMagicWalletDapp() ? (
    <div />
  ) : (
    <Button
      onClick={handleCloseButton}
      size={ButtonSize.small}
      {...rest}
      iconType={CloseIcon}
      aria-label={i18n.generic.close.toString()}
    />
  );
};

export interface ActionButtonProps extends Omit<ButtonPropTypes, 'iconType'> {
  iconType?: MonochromeIconDefinition;
}

export const BackActionButton = ({ onClick, iconType, ...rest }: ActionButtonProps) => {
  return (
    <Button
      onClick={onClick}
      size={ButtonSize.small}
      variant={ButtonVariant.subtle}
      {...rest}
      iconType={iconType || ArrowLeft}
      aria-label={i18n.generic.back.toString()}
    />
  );
};

export const AppNameHeader = () => {
  const { theme } = useTheme();
  return <div className={styles.appNameHeader}>{theme.appName}</div>;
};
