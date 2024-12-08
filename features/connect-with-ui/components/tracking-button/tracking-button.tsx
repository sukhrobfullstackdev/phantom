import React, { HTMLAttributes } from 'react';
import { trackAction } from '~/app/libs/analytics';
import { eventData } from '~/features/connect-with-ui/utils/get-login-method';

interface TrackingButtonInterface extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  actionName: string;
}

export const TrackingButton = ({ children, actionName, ...rest }: TrackingButtonInterface) => {
  return (
    <span onClickCapture={() => trackAction(actionName, eventData)} {...rest}>
      {children}
    </span>
  );
};

export default TrackingButton;
