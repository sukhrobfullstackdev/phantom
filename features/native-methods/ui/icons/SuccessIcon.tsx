import React, { SVGAttributes } from 'react';

type Props = SVGAttributes<SVGElement> & {
  size?: number;
};

export const SuccessIcon = ({ size = 40, ...rest }: Props) => {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20 40C31.0457 40 40 31.0457 40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 31.0457 8.9543 40 20 40ZM10.306 20.2261L11.5095 19.0967C11.9492 18.684 12.6796 18.7055 13.0896 19.1433L16.8449 23.153L26.9104 12.4058C27.3204 11.968 28.0508 11.9464 28.4905 12.3591L29.694 13.4885C30.0834 13.8539 30.1036 14.432 29.7406 14.8196L17.6583 27.7202C17.2302 28.1772 16.4596 28.1772 16.0315 27.7202L10.2594 21.5572C9.8964 21.1696 9.91663 20.5915 10.306 20.2261Z"
        fill="currentColor"
      />
    </svg>
  );
};
