import React, { SVGAttributes } from 'react';

type Props = SVGAttributes<SVGElement> & {
  size?: number;
};

export const ArrowDownIcon = ({ size, ...rest }: Props) => {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
      <g id="New Icon">
        <g id="Group 17861">
          <path
            id="Vector"
            d="M16 12L10 18L4 12"
            stroke="#4E4D52"
            strokeWidth="2"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            id="Vector_2"
            d="M10 2.99935L10 17.166"
            stroke="#4E4D52"
            strokeWidth="2"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </g>
    </svg>
  );
};
