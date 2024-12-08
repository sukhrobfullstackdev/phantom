import React, { PropsWithChildren } from 'react';
import { Typography } from '@magiclabs/ui';

import { useThemeMode } from '~/features/native-methods/hooks/useThemeMode';
import { useUserMetadata } from '~/features/native-methods/hooks/useUserMetadata';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { Popover, PopoverContent, PopoverTrigger } from '~/features/native-methods/ui/popover/popover';
import { IconButton } from '~/features/native-methods/ui/icon-button/icon-button';
import { UserIcon } from '~/features/native-methods/ui/icons/user-icon';
import { XIcon } from '~/features/native-methods/ui/icons/x-icon';
import { useResolveSendGalssTransaction } from '../../hooks/use-resolve-send-gasless-transaction';

export const SendGaslessTransactionLayout = ({ children }: PropsWithChildren) => {
  const { mode } = useThemeMode();
  const { email } = useUserMetadata();

  const { resolveSendGaslessTransaction } = useResolveSendGalssTransaction();

  return (
    <>
      <ModalHeader
        leftAction={
          <Popover>
            <PopoverTrigger>
              <IconButton>
                <UserIcon />
              </IconButton>
            </PopoverTrigger>
            <PopoverContent>
              <Typography.BodySmall weight="400" color={mode('var(--ink80)}', 'var(--white)')}>
                {email}
              </Typography.BodySmall>
            </PopoverContent>
          </Popover>
        }
        rightAction={
          <IconButton onClick={() => resolveSendGaslessTransaction()}>
            <XIcon />
          </IconButton>
        }
      />
      {children}
    </>
  );
};
