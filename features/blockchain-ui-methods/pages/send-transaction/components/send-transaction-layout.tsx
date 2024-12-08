import React, { PropsWithChildren } from 'react';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { BackActionButton, CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { Network } from '~/features/connect-with-ui/components/network';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { eventData } from '~/features/connect-with-ui/utils/get-login-method';
import { Spacer } from '@magiclabs/ui';
import { useIsSending } from '../hooks/use-is-sending';
import { useCloseSendTransaction } from '../hooks/use-close-send-transaction';

type Props = PropsWithChildren & {
  returnToPage?: string;
};

export const SendTransactionLayout = ({ children, returnToPage }: Props) => {
  const { navigateTo } = useControllerContext();
  const { isSending } = useIsSending();
  const { closeSendTransaction } = useCloseSendTransaction();

  return (
    <>
      <ModalHeader
        leftAction={
          returnToPage && !isSending ? (
            <BackActionButton onClick={() => navigateTo(returnToPage, eventData)} />
          ) : undefined
        }
        rightAction={<CancelActionButton onClick={closeSendTransaction} />}
        header={<Network />}
      />
      <Spacer size={32} orientation="vertical" />

      {children}
    </>
  );
};
