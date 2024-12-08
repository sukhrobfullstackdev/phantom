import React from 'react';
import { MonochromeIconDefinition } from '@magiclabs/ui';

export const TooltipIcon: MonochromeIconDefinition = {
  SVGContents: ({ fill }) => {
    return (
      <path
        {...fill}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15ZM8.39397 9.80567H7.06954V9.70226C7.07749 8.27044 7.48318 7.82896 8.18715 7.39146C8.6684 7.08919 9.03829 6.70737 9.03829 6.15055C9.03829 5.52612 8.54909 5.12044 7.94056 5.12044C7.37977 5.12044 6.83886 5.47839 6.80306 6.22612H5.38715C5.42693 4.71476 6.55647 3.94317 7.94852 3.94317C9.46783 3.94317 10.5139 4.78635 10.5139 6.13067C10.5139 7.04146 10.0565 7.63805 9.32465 8.07555C8.67636 8.47328 8.40193 8.85908 8.39397 9.70226V9.80567ZM8.64056 11.4125C8.63659 11.8977 8.23488 12.2875 7.76556 12.2875C7.28033 12.2875 6.88658 11.8977 6.89056 11.4125C6.88658 10.9352 7.28033 10.5454 7.76556 10.5454C8.23488 10.5454 8.63659 10.9352 8.64056 11.4125Z"
      />
    );
  },
  viewbox: [0, 0, 16, 16],
};

export const CheckmarkIcon: MonochromeIconDefinition = {
  SVGContents: ({ fill }) => {
    return (
      <path
        {...fill}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.15489 0.801712C9.34755 0.989238 9.35742 1.29554 9.17724 1.49509L3.90054 7.339C3.702 7.55889 3.35688 7.55889 3.15833 7.339L0.822757 4.75237C0.64258 4.55282 0.652454 4.24652 0.845108 4.05899L1.03993 3.86935C1.24307 3.67162 1.5698 3.68215 1.75979 3.89256L3.52944 5.85244L8.24021 0.635279C8.4302 0.424871 8.75693 0.414339 8.96007 0.612074L9.15489 0.801712Z"
      />
    );
  },
  viewbox: [0, 0, 10, 8],
};

export const ReturnOutlineIcon: MonochromeIconDefinition = {
  SVGContents: ({ fill }) => {
    return (
      <path
        {...fill}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.36116 3.06743C4.61558 2.84935 4.64504 2.46631 4.42697 2.21189C4.20889 1.95747 3.82585 1.928 3.57143 2.14608L1.21582 4.16517C1.08384 4.27647 1 4.44305 1 4.62921C1 4.78186 1.05637 4.92134 1.14943 5.02797C1.15848 5.03835 1.16791 5.04845 1.17771 5.05826L3.53726 7.41781C3.77421 7.65475 4.15838 7.65475 4.39532 7.41781C4.63227 7.18086 4.63227 6.79669 4.39532 6.55974L3.07154 5.23596H9.35753C11.3518 5.23596 13.0543 6.87291 13.1319 8.86631L13.1319 8.86638C13.2142 10.9719 11.4656 12.7865 9.35753 12.7865H3.62854C3.29345 12.7865 3.0218 13.0582 3.0218 13.3933C3.0218 13.7284 3.29345 14 3.62854 14H9.35753C12.1526 14 14.4537 11.6146 14.3445 8.81908C14.2415 6.17428 12.0035 4.02247 9.35753 4.02247H3.24693L4.36116 3.06743ZM14.3445 8.81908L14.3445 8.81901L13.7382 8.8427L14.3445 8.81908Z"
      />
    );
  },
  viewbox: [0, 0, 16, 16],
};
