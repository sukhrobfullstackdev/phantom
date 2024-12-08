import React, { SVGAttributes } from 'react';

type Props = SVGAttributes<SVGElement> & {
  size?: number;
};

export const ExclamtionIcon = ({ size = 40, ...rest }: Props) => {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
      <path
        d="M36.3044 30.8368L22.4034 6.38538C21.3608 4.56764 18.6385 4.50901 17.596 6.38538L3.69494 30.8368C2.65237 32.6545 3.98455 35 6.12762 35H33.8717C36.0148 35 37.347 32.7132 36.3044 30.8368ZM20.0286 25.7354C21.4767 25.7354 22.693 26.9668 22.693 28.4327C22.693 29.9573 21.4767 31.13 20.0286 31.13C18.5227 31.13 17.3643 29.9573 17.3643 28.4327C17.3643 26.9668 18.5227 25.7354 20.0286 25.7354ZM17.4801 16.0604C17.4222 15.6499 17.7697 15.2981 18.1752 15.2981H21.8242C22.2296 15.2981 22.5772 15.6499 22.5192 16.0604L22.1138 24.035C22.0559 24.4454 21.7663 24.68 21.4187 24.68H18.5806C18.2331 24.68 17.9435 24.4454 17.8856 24.035L17.4801 16.0604Z"
        fill="currentColor"
      />
    </svg>
  );
};
