import React, { SVGAttributes } from 'react';

type Props = SVGAttributes<SVGElement> & {
  size?: number;
};

export const ChevronRightIcon = ({ size = 16, ...rest }: Props) => {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
      <path
        d="M10.5269 8.35344C10.7063 8.14551 10.7063 7.85441 10.5628 7.64648L6.32873 2.82257C6.14932 2.61464 5.86227 2.61464 5.71874 2.82257L5.46757 3.11367C5.28816 3.3216 5.28816 3.61269 5.46757 3.82062L9.12753 7.97917L5.46757 12.1793C5.28816 12.3872 5.28816 12.6783 5.46757 12.8862L5.71874 13.1773C5.86227 13.3853 6.14932 13.3853 6.32873 13.1773L10.5269 8.35344Z"
        fill="currentColor"
      />
    </svg>
  );
};
