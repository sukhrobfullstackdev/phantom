import React, { SVGAttributes } from 'react';

type Props = SVGAttributes<SVGElement>;

export const DotIcon = (props: Props) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 4 4" fill="none" {...props}>
      <circle cx="2" cy="2" r="2" fill="#B6B4BA" />
    </svg>
  );
};
