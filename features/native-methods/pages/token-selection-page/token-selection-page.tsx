import React from 'react';
import { Spacer, Typography } from '@magiclabs/ui';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { BackActionButton, CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { Network } from '~/features/connect-with-ui/components/network';
import { TokenList } from '~/features/connect-with-ui/components/token-list';
import styles from './token-selection-page.less';
import { eventData } from '~/features/connect-with-ui/utils/get-login-method';
import { MAGIC_WALLET, MC_WALLET } from '~/app/constants/route-methods';
import { useUIThreadPayload } from '~/app/ui/hooks/ui-thread-hooks';
import { isWindows } from '~/app/libs/platform';
import { isChromeAgent } from '~/features/connect-with-ui/utils/get-user-agent';

export const TokenSelectionPage = () => {
  const { navigateTo } = useControllerContext();
  const payload = useUIThreadPayload();
  const isWalletUiRpcMethod = payload?.method === MAGIC_WALLET || payload?.method === MC_WALLET;

  return (
    <div className={`${styles.tokenSelectionPage} ${isWindows() && isChromeAgent ? styles.customScrollBar : ''}`}>
      <ModalHeader
        leftAction={
          isWalletUiRpcMethod ? <BackActionButton onClick={() => navigateTo('wallet-home', eventData)} /> : <div />
        }
        rightAction={<CancelActionButton />}
        header={<Network />}
      />
      <Spacer size={20} orientation="vertical" />
      <Typography.BodySmall>Choose a token</Typography.BodySmall>
      <Spacer size={15} orientation="vertical" />
      <TokenList isTokenSelectionPage />
    </div>
  );
};
