import React, { SVGAttributes } from 'react';

type Props = SVGAttributes<SVGElement> & {
  size?: number;
};

export const ArrowRightIcon = ({ size, ...rest }: Props) => {
  return (
    <svg width={size} height={size} viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
      <path
        d="M8.37216 13.2428L7.89676 12.7848C7.77791 12.6642 7.77791 12.4714 7.89676 12.375L11.5811 8.61453H3.45182C3.3092 8.61453 3.16659 8.494 3.16659 8.32526V7.65031C3.16659 7.50568 3.3092 7.36104 3.45182 7.36104H11.5811L7.89676 3.6247C7.77791 3.52827 7.77791 3.33543 7.89676 3.2149L8.37216 2.7569C8.46724 2.63637 8.65739 2.63637 8.77624 2.7569L13.7441 7.79494C13.863 7.91547 13.863 8.08421 13.7441 8.20473L8.77624 13.2428C8.65739 13.3633 8.46724 13.3633 8.37216 13.2428Z"
        fill="currentColor"
      />
    </svg>
  );
};
