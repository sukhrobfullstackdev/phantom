import React, { SVGAttributes } from 'react';
import { useThemeMode } from '../../hooks/useThemeMode';

type Props = SVGAttributes<SVGElement>;

export const CreditCardOutlineIcon = (props: Props) => {
  const { mode } = useThemeMode();

  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g clipPath="url(#clip0_1136_23024)">
        <path
          d="M22 4.03325V17.2333C22 17.8383 21.7844 18.3564 21.3532 18.7876C20.922 19.2188 20.4043 19.434 19.8 19.4333H2.2C1.595 19.4333 1.0769 19.2177 0.645702 18.7865C0.214502 18.3553 -0.000731466 17.8375 1.86757e-06 17.2333V4.03325C1.86757e-06 3.42825 0.215602 2.91015 0.646802 2.47895C1.078 2.04775 1.59573 1.83252 2.2 1.83325H19.8C20.405 1.83325 20.9231 2.04885 21.3543 2.48005C21.7855 2.91125 22.0007 3.42899 22 4.03325ZM2.2 6.23325H19.8V4.03325H2.2V6.23325ZM2.2 10.6333V17.2333H19.8V10.6333H2.2Z"
          fill={mode('white', 'black')}
        />
      </g>
      <defs>
        <clipPath id="clip0_1136_23024">
          <rect width="22" height="22" fill={mode('white', 'black')} />
        </clipPath>
      </defs>
    </svg>
  );
};
