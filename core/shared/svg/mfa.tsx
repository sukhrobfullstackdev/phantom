import React from 'react';
import { MonochromeIconDefinition } from '@magiclabs/ui';

export const LockIcon: MonochromeIconDefinition = {
  SVGContents: ({ fill }) => {
    return (
      <path
        d="M9 16.4063C9.44196 16.4063 9.80357 16.0547 9.80357 15.625V13.125C9.80357 12.6953 9.44196 12.3438 9 12.3438C8.55804 12.3438 8.19643 12.6953 8.19643 13.125V15.625C8.19643 16.0547 8.55804 16.4063 9 16.4063ZM18 10.625C18 9.60938 17.1161 8.75 16.0714 8.75H15.4286V6.32813C15.4286 2.89063 12.5357 0.0390625 9 0C5.46429 0 2.57143 2.8125 2.57143 6.25V8.75H1.92857C0.84375 8.75 0 9.60938 0 10.625V18.125C0 19.1797 0.84375 20 1.92857 20H16.0714C17.1161 20 18 19.1797 18 18.125V10.625ZM3.85714 8.75V6.25C3.85714 3.51563 6.14732 1.25 9 1.25C11.8125 1.25 14.1429 3.51563 14.1429 6.25V8.75H3.85714ZM16.7143 18.125C16.7143 18.4766 16.3929 18.75 16.0714 18.75H1.92857C1.56696 18.75 1.28571 18.4766 1.28571 18.125V10.625C1.28571 10.3125 1.56696 10 1.92857 10H16.0714C16.3929 10 16.7143 10.3125 16.7143 10.625V18.125Z"
        {...fill}
      />
    );
  },

  viewbox: [0, 0, 18, 20],
};

export const KeyIcon: MonochromeIconDefinition = {
  SVGContents: ({ fill }) => {
    return (
      <>
        <path
          {...fill}
          d="M8.70483 12.2511C8.21502 11.7588 7.93985 11.0911 7.93985 10.3949C7.93985 9.6987 8.21502 9.03102 8.70483 8.53874C9.19464 8.04646 9.85897 7.7699 10.5517 7.7699C11.2444 7.7699 11.9087 8.04646 12.3985 8.53874C12.8883 9.03102 13.1635 9.6987 13.1635 10.3949C13.1635 11.0911 12.8883 11.7588 12.3985 12.2511C11.9087 12.7433 11.2444 13.0199 10.5517 13.0199C9.85897 13.0199 9.19464 12.7433 8.70483 12.2511Z"
        />
        <path
          {...fill}
          d="M23.3608 4.0312C20.7947 1.45212 17.3149 0.00222552 13.6859 0C6.17014 0 -3.8147e-06 5.9199 -3.8147e-06 13.545C0.00220871 17.1924 1.44482 20.6897 4.01094 23.2688C6.57707 25.8479 10.0568 27.2978 13.6859 27.3C14.7933 27.3 15.8882 27.1404 16.9245 26.8716C16.9494 27.5509 17.2355 28.194 17.7227 28.6656C18.2098 29.1372 18.86 29.4005 19.5363 29.4H23.1929V33.075C23.1929 34.524 24.363 35.7 25.8047 35.7H29.4633V38.325C29.4633 39.2997 29.8486 40.2344 30.5343 40.9236C31.22 41.6128 32.1501 42 33.1198 42H38.3435C40.3619 42 42 40.3536 42 38.325V33.7638C41.9994 32.2324 41.3936 30.764 40.3159 29.6814L27.2882 16.5858C27.2246 16.5185 27.1782 16.4368 27.1527 16.3476C27.1273 16.2584 27.1236 16.1643 27.1419 16.0734C27.2673 15.351 27.3718 14.5677 27.3718 13.755C27.3696 10.1076 25.9269 6.61028 23.3608 4.0312ZM21.1446 6.25859C23.123 8.24693 24.2354 10.9431 24.2376 13.755C24.2274 14.3507 24.1658 14.9444 24.0537 15.5295C23.948 16.1187 23.985 16.7248 24.1618 17.2965C24.3385 17.8682 24.6498 18.3887 25.0692 18.8139L38.099 31.9074C38.5879 32.3988 38.8637 33.0687 38.8637 33.7638V38.325C38.8637 38.4642 38.8087 38.5978 38.7107 38.6962C38.6128 38.7947 38.4799 38.85 38.3414 38.85H33.1178C32.9792 38.85 32.8464 38.7947 32.7484 38.6962C32.6504 38.5978 32.5954 38.4642 32.5954 38.325V35.175C32.5954 33.726 31.4253 32.55 29.9836 32.55H26.327V28.875C26.327 27.426 25.157 26.25 23.7152 26.25H20.0608V24.675C20.0611 24.4141 19.9969 24.1572 19.874 23.9274C19.7511 23.6976 19.5733 23.5021 19.3566 23.3584C19.1399 23.2148 18.8911 23.1275 18.6325 23.1043C18.374 23.0812 18.1137 23.123 17.8752 23.226C16.5693 23.7909 15.1067 24.15 13.6859 24.15C10.8881 24.1478 8.20549 23.0297 6.22714 21.0414C4.24879 19.0531 3.13638 16.3569 3.13417 13.545C3.13417 7.7301 7.83125 3.15 13.6859 3.15C16.4837 3.15222 19.1663 4.27025 21.1446 6.25859Z"
        />
      </>
    );
  },

  viewbox: [0, 0, 42, 42],
};

export const GoogleAuthenticatorIcon: MonochromeIconDefinition = {
  SVGContents: () => {
    return (
      <>
        <path
          d="M37.8125 22C37.8125 23.4713 36.6198 24.6641 35.1484 24.6641H25.9531L22 16.671L26.2669 9.28081C27.0025 8.00668 28.6317 7.5701 29.9059 8.30566L29.9064 8.30595C31.1807 9.04156 31.6173 10.6709 30.8817 11.9451L26.6148 19.3359H35.1484C36.6198 19.3359 37.8125 20.5287 37.8125 22Z"
          fill="#1A73E8"
        />
        <path
          d="M29.9071 35.6941L29.9066 35.6943C28.6324 36.4299 27.0032 35.9933 26.2676 34.7192L22.0007 27.329L17.7339 34.7192C16.9982 35.9933 15.369 36.4299 14.0948 35.6943L14.0943 35.6941C12.8201 34.9584 12.3834 33.3291 13.119 32.0549L17.3859 24.6641L22.0007 24.4922L26.6156 24.6641L30.8824 32.0549C31.618 33.3291 31.1814 34.9584 29.9071 35.6941Z"
          fill="#EA4335"
        />
        <path
          d="M22.0007 16.671L20.7976 19.9375L17.3859 19.3359L13.119 11.9451C12.3834 10.6709 12.8201 9.04156 14.0943 8.30595L14.0948 8.30566C15.369 7.5701 16.9982 8.00668 17.7339 9.28081L22.0007 16.671Z"
          fill="#FBBC04"
        />
        <path
          d="M21.3125 19.3359L18.2188 24.6641H8.85156C7.38024 24.6641 6.1875 23.4713 6.1875 22C6.1875 20.5287 7.38024 19.3359 8.85156 19.3359H21.3125Z"
          fill="#34A853"
        />
        <path d="M26.6145 24.6641H17.3848L21.9996 16.671L26.6145 24.6641Z" fill="#185DB7" />
      </>
    );
  },
  viewbox: [0, 0, 44, 44],
};

export const AuthyAuthenticatorIcon: MonochromeIconDefinition = {
  SVGContents: () => {
    return (
      <>
        <g clipPath="url(#clip0_2601_41405)">
          <path
            d="M44 21.9997C44 34.1509 34.1505 44 21.9995 44C9.84913 44 0 34.1509 0 21.9997C0 9.8493 9.84913 0 21.9995 0C34.1505 0 44 9.8493 44 21.9997Z"
            fill="#EC1C24"
          />
          <path
            d="M20.1144 17.3405L25.3894 22.6136C26.1508 23.376 27.3871 23.376 28.1504 22.6136C28.912 21.8513 28.9137 20.6161 28.1504 19.8536L22.8751 14.5785C19.1005 10.803 13 10.7422 9.14534 14.3866C9.10935 14.4165 9.07466 14.448 9.04136 14.4808C9.02451 14.4977 9.01076 14.5155 8.99409 14.5307C8.97691 14.5472 8.95937 14.562 8.94305 14.5785C8.9097 14.6116 8.87928 14.6465 8.85023 14.6811C5.20391 18.5374 5.26664 24.6381 9.04153 28.4134L14.3167 33.6875C15.0798 34.4494 16.3144 34.4494 17.0774 33.6875C17.8408 32.9249 17.8408 31.6881 17.0793 30.9272L11.8039 25.6522C9.50112 23.3503 9.48565 19.6144 11.7561 17.2927C14.0775 15.0222 17.8113 15.0386 20.1144 17.3405ZM26.9227 10.3154C26.1605 11.078 26.1605 12.3131 26.9248 13.0756L32.1981 18.3509C34.4995 20.6527 34.5144 24.388 32.2441 26.7102C29.9221 28.979 26.1895 28.9639 23.8871 26.6618L18.6119 21.3871C17.8491 20.6245 16.6125 20.6245 15.8505 21.3871C15.0869 22.149 15.0869 23.3881 15.8505 24.1483L21.124 29.4238C24.8997 33.199 30.9996 33.2604 34.8549 29.6156C34.8907 29.584 34.9244 29.5546 34.9598 29.5213C34.9759 29.5049 34.991 29.4883 35.0067 29.4714C35.0239 29.4551 35.0405 29.44 35.0565 29.4217C35.0904 29.3903 35.1193 29.3557 35.1493 29.3197C38.7957 25.4648 38.7347 19.3662 34.9599 15.5887L29.6847 10.3153C28.9223 9.55162 27.6845 9.55162 26.9227 10.3154Z"
            fill="white"
          />
        </g>
        <defs>
          <clipPath id="clip0_2601_41405">
            <rect width="44" height="44" fill="white" />
          </clipPath>
        </defs>
      </>
    );
  },
  viewbox: [0, 0, 44, 44],
};
