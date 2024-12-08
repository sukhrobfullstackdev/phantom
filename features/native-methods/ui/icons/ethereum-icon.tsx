import React, { SVGAttributes } from 'react';

type Props = SVGAttributes<SVGElement>;

export const EthereumIcon = (props: Props) => {
  return (
    <svg width="13" height="20" viewBox="0 0 13 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M6.16821 15.0001V20.0001L12.2897 11.3552L6.16821 15.0001Z" fill="#18171A" />
      <path d="M6.16822 0L12.2897 10.1869L6.16822 13.8318L0 10.1869" fill="#18171A" />
      <path d="M6.16822 0V7.38318L0 10.1869M0 11.3551L6.16822 15V20" fill="#18171A" />
      <path d="M6.16821 7.38306V13.8317L12.2897 10.1868" fill="#18171A" />
      <path d="M0 10.1868L6.16822 7.38306V13.8317" fill="#18171A" />
    </svg>
  );
};
