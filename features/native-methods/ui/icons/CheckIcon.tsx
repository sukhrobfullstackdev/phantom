import React, { SVGAttributes } from 'react';

type Props = SVGAttributes<SVGElement> & {
  size?: number;
};

export const CheckIcon = ({ size = 24, ...rest }: Props) => {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.6549 3.84759C13.8475 4.03512 13.8574 4.34142 13.6772 4.54096L6.41035 12.589C6.21181 12.8089 5.86669 12.8089 5.66815 12.589L2.32276 8.884C2.14258 8.68446 2.15245 8.37816 2.34511 8.19063L2.8439 7.70511C3.04704 7.50738 3.37377 7.51791 3.56376 7.72832L6.03925 10.4699L12.4362 3.38528C12.6262 3.17487 12.953 3.16434 13.1561 3.36207L13.6549 3.84759Z"
        fill="currentColor"
      />
    </svg>
  );
};
