import { Typography } from '@magiclabs/ui';
import React, { PropsWithChildren } from 'react';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { IconButton } from '~/features/native-methods/ui/icon-button/icon-button';
import { UserIcon } from '~/features/native-methods/ui/icons/user-icon';
import { Popover, PopoverContent, PopoverTrigger } from '~/features/native-methods/ui/popover/popover';
import { useNFTTransferParams } from '../hooks/use-nft-transfer-params';
import { Animate } from '~/features/native-methods/components/animate/animate';

type Props = PropsWithChildren;

export const ConfirmNFTTransferLayout = ({ children }: Props) => {
  const { nftTransferParams } = useNFTTransferParams();

  return (
    <>
      <ModalHeader
        leftAction={
          nftTransferParams && (
            <Popover>
              <PopoverTrigger>
                <IconButton>
                  <UserIcon />
                </IconButton>
              </PopoverTrigger>
              <PopoverContent>
                <Typography.BodySmall weight="400" color="var(--ink80)}">
                  {nftTransferParams.email}
                </Typography.BodySmall>
              </PopoverContent>
            </Popover>
          )
        }
        header={
          <Typography.BodySmall color="var(--ink70)">
            {nftTransferParams && Number(nftTransferParams.nft.quantity) > 1
              ? `Send ${nftTransferParams.nft.quantity} Collectibles`
              : 'Send Collectible'}
          </Typography.BodySmall>
        }
      />
      <Animate exitBeforeEnter>{children}</Animate>
    </>
  );
};
