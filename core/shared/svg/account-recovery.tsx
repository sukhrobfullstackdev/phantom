import React from 'react';
import { MonochromeIconDefinition } from '@magiclabs/ui';

export const PhoneLogo: MonochromeIconDefinition = {
  SVGContents: ({ fill }) => {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M22 8.5C21.1716 8.5 20.5 9.17157 20.5 10C20.5 10.8284 21.1716 11.5 22 11.5H26C26.8284 11.5 27.5 10.8284 27.5 10C27.5 9.17157 26.8284 8.5 26 8.5H22Z"
          {...fill}
        />
        <path
          d="M20 36.5C19.1716 36.5 18.5 37.1716 18.5 38C18.5 38.8284 19.1716 39.5 20 39.5H28C28.8284 39.5 29.5 38.8284 29.5 38C29.5 37.1716 28.8284 36.5 28 36.5H20Z"
          {...fill}
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M14 2.5C11.5147 2.5 9.5 4.51472 9.5 7V41C9.5 43.4853 11.5147 45.5 14 45.5H34C36.4853 45.5 38.5 43.4853 38.5 41V7C38.5 4.51472 36.4853 2.5 34 2.5H14ZM12.5 7C12.5 6.17157 13.1716 5.5 14 5.5H34C34.8284 5.5 35.5 6.17157 35.5 7V41C35.5 41.8284 34.8284 42.5 34 42.5H14C13.1716 42.5 12.5 41.8284 12.5 41V7Z"
          {...fill}
        />
      </svg>
    );
  },
  viewbox: [0, 0, 48, 48],
  color: theme => theme.hex.primary.base,
};

export const SuccessShieldLogo: MonochromeIconDefinition = {
  SVGContents: ({ fill }) => {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M33.0392 20.9142C33.8203 20.1332 33.8203 18.8668 33.0392 18.0858C32.2582 17.3047 30.9918 17.3047 30.2108 18.0858L22.625 25.6716L19.5392 22.5858C18.7582 21.8047 17.4918 21.8047 16.7108 22.5858C15.9297 23.3668 15.9297 24.6332 16.7108 25.4142L21.2108 29.9142C21.5859 30.2893 22.0946 30.5 22.625 30.5C23.1554 30.5 23.6641 30.2893 24.0392 29.9142L33.0392 20.9142Z"
          {...fill}
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M24.5698 2.08025C24.2038 1.9733 23.8148 1.97325 23.4487 2.0801L5.43967 7.3361C4.5865 7.5851 4 8.36724 4 9.256V20.029C4.00009 25.974 5.87105 31.7682 9.34777 36.5906C12.8245 41.413 17.7306 45.0189 23.371 46.8975C23.7813 47.0342 24.2249 47.0342 24.6352 46.8974C30.2739 45.0186 35.1785 41.4131 38.654 36.5917C42.1296 31.7703 43.9999 25.9775 44 20.034V9.256C44 8.36744 43.4138 7.58542 42.5608 7.33625L24.5698 2.08025ZM8 20.029V10.7557L24.0087 6.08352L40 10.7553V20.034C39.9999 25.1379 38.3938 30.1123 35.4092 34.2526C32.5553 38.2117 28.5792 41.2161 24.0029 42.8822C19.4249 41.2162 15.4475 38.2114 12.5924 34.2513C9.60678 30.1101 8.00007 25.1343 8 20.029Z"
          {...fill}
        />
      </svg>
    );
  },
  viewbox: [0, 0, 48, 48],
  color: theme => theme.hex.primary.base,
};

export const WarningShieldLogo: MonochromeIconDefinition = {
  SVGContents: ({ fill, stroke }) => {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M26.5078 33C26.5078 34.3807 25.3925 35.5 24.0168 35.5H23.9989C22.6231 35.5 21.5078 34.3807 21.5078 33C21.5078 31.6193 22.6231 30.5 23.9989 30.5L24.0168 30.5C25.3925 30.5 26.5078 31.6193 26.5078 33Z"
          {...fill}
        />
        <path d="M23.9961 25L23.9961 15" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" {...stroke} />
        <path
          d="M6 9.256L24.009 4L42 9.256V20.034C41.9999 25.5577 40.2617 30.9413 37.0316 35.4222C33.8016 39.903 29.2434 43.2539 24.003 45C18.761 43.2541 14.2013 39.9028 10.9701 35.421C7.73891 30.9392 6.00008 25.5541 6 20.029V9.256Z"
          strokeWidth="4"
          strokeLinejoin="round"
          {...stroke}
        />
      </svg>
    );
  },
  viewbox: [0, 0, 48, 48],
  color: theme => theme.hex.primary.base,
};

export const KeyholeShieldLogo: MonochromeIconDefinition = {
  SVGContents: ({ stroke }) => {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M6 9.256L24.009 4L42 9.256V20.034C41.9999 25.5577 40.2617 30.9413 37.0316 35.4222C33.8016 39.903 29.2434 43.2539 24.003 45C18.761 43.2541 14.2013 39.9028 10.9701 35.421C7.73891 30.9392 6.00008 25.5541 6 20.029V9.256Z"
          strokeWidth="4"
          strokeLinejoin="round"
          {...stroke}
        />
        <path d="M24 29.0196L24 21.0039" strokeWidth="4.00793" strokeLinecap="round" {...stroke} />
        <path
          d="M23.991 20.002H24.009"
          strokeWidth="8.01586"
          strokeLinecap="round"
          strokeLinejoin="round"
          {...stroke}
        />
      </svg>
    );
  },
  viewbox: [0, 0, 48, 48],
  color: theme => theme.hex.primary.base,
};

export const LockShieldLogo: MonochromeIconDefinition = {
  SVGContents: ({ fill }) => {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M28.0312 22.125H28.6875C29.4121 22.125 30 22.7129 30 23.4375V28.6875C30 29.4121 29.4121 30 28.6875 30H19.0625C18.3379 30 17.75 29.4121 17.75 28.6875V23.4375C17.75 22.7129 18.3379 22.125 19.0625 22.125H19.7188V20.1562C19.7188 17.8648 21.5836 16 23.875 16C26.1664 16 28.0312 17.8648 28.0312 20.1562V22.125ZM21.9062 20.1562V22.125H25.8438V20.1562C25.8438 19.0707 24.9605 18.1875 23.875 18.1875C22.7895 18.1875 21.9062 19.0707 21.9062 20.1562Z"
          {...fill}
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M24.5698 2.08025C24.2038 1.9733 23.8148 1.97325 23.4487 2.0801L5.43967 7.3361C4.5865 7.5851 4 8.36724 4 9.256V20.029C4.00009 25.974 5.87105 31.7682 9.34777 36.5906C12.8245 41.413 17.7306 45.0189 23.371 46.8975C23.7813 47.0342 24.2249 47.0342 24.6352 46.8974C30.2739 45.0186 35.1785 41.4131 38.654 36.5917C42.1296 31.7703 43.9999 25.9775 44 20.034V9.256C44 8.36744 43.4138 7.58542 42.5608 7.33625L24.5698 2.08025ZM8 20.029V10.7557L24.0087 6.08352L40 10.7553V20.034C39.9999 25.1379 38.3938 30.1123 35.4092 34.2526C32.5553 38.2117 28.5792 41.2161 24.0029 42.8822C19.4249 41.2162 15.4475 38.2114 12.5924 34.2513C9.60678 30.1101 8.00007 25.1343 8 20.029Z"
          {...fill}
        />
      </svg>
    );
  },
  viewbox: [0, 0, 48, 48],
  color: theme => theme.hex.primary.base,
};

export const WarningLogo: MonochromeIconDefinition = {
  SVGContents: () => {
    return (
      <svg width="50" height="48" viewBox="0 0 50 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M25.4391 5.93721C25.2496 5.58978 24.7507 5.58977 24.5612 5.93721L3.93025 43.7606C3.74852 44.0937 3.98967 44.5 4.3692 44.5H45.631C46.0106 44.5 46.2517 44.0937 46.07 43.7606L25.4391 5.93721ZM21.9276 4.50065C23.2541 2.06864 26.7463 2.06862 28.0728 4.50066L48.7037 42.324C49.9758 44.6563 48.2877 47.5 45.631 47.5H4.3692C1.7125 47.5 0.0243948 44.6563 1.29657 42.324L21.9276 4.50065ZM25 18.5C25.8284 18.5 26.5 19.1716 26.5 20V28C26.5 28.8284 25.8284 29.5 25 29.5C24.1716 29.5 23.5 28.8284 23.5 28V20C23.5 19.1716 24.1716 18.5 25 18.5ZM24.9893 34C23.8847 34 22.9893 34.8954 22.9893 36C22.9893 37.1046 23.8847 38 24.9893 38H25.0072C26.1118 38 27.0072 37.1046 27.0072 36C27.0072 34.8954 26.1118 34 25.0072 34H24.9893Z"
          fill="var(--alert70)"
        />
      </svg>
    );
  },
  viewbox: [0, 0, 50, 48],
};
