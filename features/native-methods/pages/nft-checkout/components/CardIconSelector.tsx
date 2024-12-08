import React from 'react';
import { CARD_TYPES } from '../constants';
import { VisaCardIcon } from '~/features/native-methods/ui/icons/VisaCardIcon';
import { MasterCardIcon } from '~/features/native-methods/ui/icons/MasterCardIcon';
import { AmexCardIcon } from '~/features/native-methods/ui/icons/AmexCardIcon';
import { DiscoverCardIcon } from '~/features/native-methods/ui/icons/DiscoverCardIcon';
import { CardIcon } from '~/features/native-methods/ui/icons/CardIcon';

type Props = {
  type?: string;
};

export const CardIconSelector = ({ type }: Props) => {
  switch (type) {
    case CARD_TYPES.VISA:
      return <VisaCardIcon />;
    case CARD_TYPES.MASTERCARD:
      return <MasterCardIcon />;
    case CARD_TYPES.AMERICAN_EXPRESS:
      return <AmexCardIcon />;
    case CARD_TYPES.DISCOVER:
      return <DiscoverCardIcon />;
    default:
      return <CardIcon />;
  }
};
