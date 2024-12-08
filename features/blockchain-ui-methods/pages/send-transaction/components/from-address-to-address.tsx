import { Flex, HoverActivatedTooltip, Typography } from '@magiclabs/ui';
import React from 'react';
import { useThemeMode } from '~/features/native-methods/hooks/useThemeMode';
import { ArrowRightIcon } from '~/features/native-methods/ui/icons/arrow-right-icon';
import { shortenWalletAddress } from '~/features/native-methods/utils/shorten-wallet-address';

type Props = {
  from: string;
  to: string;
  linkToWallet: (address: string) => void;
};

export const FromAddressToAddress = ({ from, to, linkToWallet }: Props) => {
  const { mode } = useThemeMode();

  return (
    <Flex.Row alignItems="center" style={{ gap: '12px' }}>
      <HoverActivatedTooltip placement="top" appearance="none">
        <HoverActivatedTooltip.Anchor onClick={() => linkToWallet(from)} style={{ cursor: 'pointer' }}>
          <Typography.BodyMedium>{shortenWalletAddress(from.toString(), 4, 4)}</Typography.BodyMedium>
        </HoverActivatedTooltip.Anchor>
        <HoverActivatedTooltip.Content
          style={{
            padding: '8px 12px',
            borderRadius: '12px',
            boxShadow: '0px 4px 20px 0px rgba(0, 0, 0, 0.10)',
            backgroundColor: mode('white', 'black'),
          }}
        >
          <Typography.BodySmall weight="400" color="var(--ink70)" style={{ whiteSpace: 'nowrap' }}>
            View address details
          </Typography.BodySmall>
        </HoverActivatedTooltip.Content>
      </HoverActivatedTooltip>

      <ArrowRightIcon color={mode('var(--ink70)', 'white')} size={16} />

      {to ? (
        <HoverActivatedTooltip placement="top" appearance="none">
          <HoverActivatedTooltip.Anchor onClick={() => linkToWallet(to)} style={{ cursor: 'pointer' }}>
            <Typography.BodyMedium>{shortenWalletAddress(to.toString(), 4, 4)}</Typography.BodyMedium>
          </HoverActivatedTooltip.Anchor>
          <HoverActivatedTooltip.Content
            style={{
              padding: '8px 12px',
              borderRadius: '12px',
              boxShadow: '0px 4px 20px 0px rgba(0, 0, 0, 0.10)',
              backgroundColor: mode('white', 'black'),
            }}
          >
            <Typography.BodySmall weight="400" color="var(--ink70)" style={{ whiteSpace: 'nowrap' }}>
              View address details
            </Typography.BodySmall>
          </HoverActivatedTooltip.Content>
        </HoverActivatedTooltip>
      ) : (
        <Typography.BodyMedium>Contract Deployment</Typography.BodyMedium>
      )}
    </Flex.Row>
  );
};
