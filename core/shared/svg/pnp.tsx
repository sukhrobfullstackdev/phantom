import { MonochromeIconDefinition } from '@magiclabs/ui';
import React from 'react';

export const Email_linkPNPIcon: MonochromeIconDefinition = {
  SVGContents: ({ theme }) => {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M4 3.25A2.75 2.75 0 0 0 1.25 6v12A2.75 2.75 0 0 0 4 20.75h16A2.75 2.75 0 0 0 22.75 18V6A2.75 2.75 0 0 0 20 3.25H4ZM2.916 5.376A1.25 1.25 0 0 1 4 4.75h16c.463 0 .867.252 1.084.626a.759.759 0 0 0-.029.02l-8.708 6.417a.585.585 0 0 1-.694 0L2.945 5.396a.777.777 0 0 0-.029-.02Zm-.166 1.74V18c0 .69.56 1.25 1.25 1.25h16c.69 0 1.25-.56 1.25-1.25V7.116l-8.014 5.905a2.084 2.084 0 0 1-2.473 0L2.75 7.116Z"
          fill="#77767A"
        />
      </svg>
    );
  },

  viewbox: [0, 0, 24, 24],
};

export const SmsPNPIcon: MonochromeIconDefinition = {
  SVGContents: ({ theme }) => {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M8.5 19.45a.75.75 0 0 1 .75-.75h5.5a.75.75 0 0 1 0 1.5h-5.5a.75.75 0 0 1-.75-.75ZM8 5.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
          fill="#77767A"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M4.5 4a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v16a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3V4Zm3-1.5h9A1.5 1.5 0 0 1 18 4v16a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 20V4a1.5 1.5 0 0 1 1.5-1.5Z"
          fill="#77767A"
        />
      </svg>
    );
  },

  viewbox: [0, 0, 24, 24],
};

export default {
  Email_linkPNPIcon, // PNP Auth LoginType name matching
  SmsPNPIcon,
};
