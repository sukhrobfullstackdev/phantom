import { MonochromeIconDefinition } from '@magiclabs/ui';
import React from 'react';

export const SuccessCheckmarkWithCircle: MonochromeIconDefinition = {
  SVGContents: ({ fill }) => {
    return (
      <path
        d="M20 0C8.95161 0 0 9.03226 0 20C0 31.0484 8.95161 40 20 40C30.9677 40 40 31.0484 40 20C40 9.03226 30.9677 0 20 0ZM20 37.4194C10.4032 37.4194 2.58065 29.6774 2.58065 20C2.58065 10.4839 10.3226 2.58065 20 2.58065C29.5161 2.58065 37.4194 10.4032 37.4194 20C37.4194 29.5968 29.5968 37.4194 20 37.4194ZM31.371 15.3226C31.7742 14.9194 31.7742 14.2742 31.371 13.9516L30.7258 13.2258C30.3226 12.8226 29.6774 12.8226 29.3548 13.2258L16.129 26.2903L10.5645 20.7258C10.2419 20.3226 9.59677 20.3226 9.19355 20.7258L8.54839 21.371C8.14516 21.7742 8.14516 22.3387 8.54839 22.7419L15.4839 29.7581C15.8065 30.0806 16.4516 30.0806 16.8548 29.7581L31.371 15.3226Z"
        {...fill}
      />
    );
  },

  viewbox: [0, 0, 40, 40],

  color: theme => theme.hex.primary.base,
};

export const TrafficCone: MonochromeIconDefinition = {
  SVGContents: ({ fill }) => {
    return (
      <path
        d="M39.375 37.5H37.5L22.9688 0.9375C22.7344 0.390625 22.2656 0 21.6406 0H18.2812C17.6562 0 17.1875 0.390625 16.9531 0.9375L2.42188 37.5H0.625C0.234375 37.5 0 37.8125 0 38.125V39.375C0 39.7656 0.234375 40 0.625 40H39.375C39.6875 40 40 39.7656 40 39.375V38.125C40 37.8125 39.6875 37.5 39.375 37.5ZM29.8438 25H10.0781L14.0625 15H25.8594L29.8438 25ZM18.9844 2.5H20.9375L24.9219 12.5H15L18.9844 2.5ZM5.07812 37.5L9.0625 27.5H30.8594L34.8438 37.5H5.07812Z"
        {...fill}
      />
    );
  },

  viewbox: [0, 0, 40, 40],
  color: theme => theme.hex.error.base,
};

export const AlertIcon: MonochromeIconDefinition = {
  SVGContents: ({ fill }) => {
    return (
      <path
        d="M20 27.4464C18.9062 27.4464 18.125 28.3041 18.125 29.3177C18.125 30.4094 18.9062 31.1891 20 31.1891C21.0156 31.1891 21.875 30.4094 21.875 29.3177C21.875 28.3041 21.0156 27.4464 20 27.4464ZM19.2969 25.575H20.625C20.9375 25.575 21.25 25.3411 21.25 25.0292L21.7969 14.425C21.7969 14.425 21.7969 14.425 21.7969 14.347C21.7969 14.0351 21.4844 13.7232 21.1719 13.7232H18.75C18.4375 13.7232 18.125 14.0351 18.125 14.347C18.125 14.425 18.125 14.425 18.125 14.425L18.6719 25.0292C18.6719 25.3411 18.9844 25.575 19.2969 25.575ZM2.5 8.73294C2.5 5.30214 5.23438 2.5731 8.75 2.49513C10.1562 2.5731 11.5625 3.04094 12.6562 3.89864C13.5156 3.58674 14.375 3.27485 15.3125 3.11891C13.6719 1.24756 11.3281 0 8.75 0C3.90625 0.0779727 0 3.97661 0 8.73294C0 10.7602 0.703125 12.6316 1.875 14.1131C2.26562 13.2554 2.65625 12.3977 3.20312 11.6179C2.73438 10.7602 2.5 9.82456 2.5 8.73294ZM31.25 0C28.5938 0 26.25 1.24756 24.6094 3.11891C25.5469 3.35283 26.4062 3.58674 27.3438 3.97661C28.3594 3.04094 29.7656 2.5731 31.25 2.5731C34.6875 2.5731 37.4219 5.30214 37.5 8.81092C37.4219 9.82456 37.1875 10.7602 36.7188 11.6179C37.2656 12.3977 37.6562 13.2554 38.125 14.1131C39.2188 12.6316 40 10.7602 40 8.73294C39.9219 3.97661 36.0156 0.0779727 31.25 0ZM20 4.99025C10.3125 4.99025 2.5 12.8655 2.5 22.4561V22.5341C2.5 26.9006 4.0625 30.8772 6.71875 33.9181L2.65625 37.9727C2.5 38.1287 2.42188 38.2846 2.42188 38.4405C2.42188 38.5965 2.5 38.7524 2.65625 38.9084L3.51562 39.7661C3.67188 39.922 3.82812 39.922 3.98438 39.922C4.14062 39.922 4.29688 39.922 4.375 39.7661L8.51562 35.7115C11.5625 38.3626 15.5469 39.922 19.9219 39.922C24.2969 39.922 28.3594 38.3626 31.4062 35.7115L35.5469 39.7661C35.625 39.922 35.7812 40 35.9375 40C36.0938 40 36.25 39.922 36.4062 39.7661L37.2656 38.9084C37.4219 38.7524 37.4219 38.5965 37.4219 38.4405C37.4219 38.2846 37.4219 38.1287 37.2656 38.0507L33.2031 33.9181C35.8594 30.8772 37.4219 26.9006 37.4219 22.5341C37.4219 22.5341 37.5 22.5341 37.5 22.4561C37.5 12.8655 29.6094 4.99025 20 4.99025ZM20 37.4269C11.7188 37.4269 5 30.7212 5 22.4561C5 14.269 11.7188 7.48538 20 7.48538C28.2031 7.48538 35 14.269 35 22.4561C35 30.7212 28.2031 37.4269 20 37.4269Z"
        {...fill}
      />
    );
  },

  viewbox: [0, 0, 40, 40],

  color: theme => theme.hex.primary.base,
};

export const TryAgainIcon: MonochromeIconDefinition = {
  SVGContents: ({ fill }) => {
    return (
      <path
        d="M35.635 0.74792L31.6668 4.7208C28.3335 2.17816 24.1272 0.589005 19.6034 0.589005C8.80994 0.668463 -0.0788367 9.48826 0.000527366 20.374C0.000527366 31.2597 8.80994 40 19.6828 40C24.6827 40 29.3652 38.093 32.8572 34.9942C33.2541 34.5969 33.2541 33.9612 32.8572 33.5639L32.3017 33.0077C31.9842 32.6899 31.3493 32.6104 31.0319 33.0077C27.9367 35.7887 23.8891 37.2984 19.6828 37.2984C10.3179 37.2984 2.6989 29.75 2.6989 20.2945C2.6989 10.9185 10.2385 3.29057 19.6828 3.29057C23.3336 3.29057 26.8256 4.48243 29.762 6.62779L25.4764 10.9185C23.8891 12.5077 25.0002 15.2092 27.3018 15.2092H37.4604C38.8095 15.2092 40 14.0968 40 12.6666V2.49599C40 0.271175 37.2223 -0.841233 35.635 0.74792ZM37.4604 12.6666H27.3018L37.4604 2.49599V12.6666Z"
        {...fill}
      />
    );
  },

  viewbox: [0, 0, 40, 40],
};

export const DeniedIcon: MonochromeIconDefinition = {
  SVGContents: ({ fill }) => {
    return (
      <path
        d="M20 0C8.96 0 0 8.96 0 20C0 31.04 8.96 40 20 40C31.04 40 40 31.04 40 20C40 8.96 31.04 0 20 0ZM4 20C4 11.16 11.16 4 20 4C23.7 4 27.1 5.26 29.8 7.38L7.38 29.8C5.18353 27.0063 3.99278 23.5538 4 20ZM20 36C16.3 36 12.9 34.74 10.2 32.62L32.62 10.2C34.8165 12.9937 36.0072 16.4462 36 20C36 28.84 28.84 36 20 36Z"
        {...fill}
      />
    );
  },

  viewbox: [0, 0, 40, 40],
};

export const WindowCloseIcon: MonochromeIconDefinition = {
  SVGContents: ({ fill }) => {
    return (
      <path
        d="M36.25 0H3.75C1.64062 0 0 1.71875 0 3.75V31.25C0 33.3594 1.64062 35 3.75 35H36.25C38.2812 35 40 33.3594 40 31.25V3.75C40 1.71875 38.2812 0 36.25 0ZM37.5 31.25C37.5 31.9531 36.875 32.5 36.25 32.5H3.75C3.04688 32.5 2.5 31.9531 2.5 31.25V3.75C2.5 3.125 3.04688 2.5 3.75 2.5H36.25C36.875 2.5 37.5 3.125 37.5 3.75V31.25ZM27.1875 12.2656C27.5781 11.875 27.5781 11.3281 27.1875 10.9375L26.5625 10.3125C26.1719 9.92188 25.625 9.92188 25.2344 10.3125L20 15.625L14.6875 10.3125C14.2969 9.92188 13.75 9.92188 13.3594 10.3125L12.7344 10.9375C12.3438 11.3281 12.3438 11.875 12.7344 12.2656L18.0469 17.5L12.7344 22.8125C12.3438 23.2031 12.3438 23.75 12.7344 24.1406L13.3594 24.7656C13.75 25.1562 14.2969 25.1562 14.6875 24.7656L20 19.4531L25.2344 24.7656C25.625 25.1562 26.1719 25.1562 26.5625 24.7656L27.1875 24.1406C27.5781 23.75 27.5781 23.2031 27.1875 22.8125L21.875 17.5L27.1875 12.2656Z"
        {...fill}
      />
    );
  },

  viewbox: [0, 0, 40, 35],
};

export const HourglassIcon: MonochromeIconDefinition = {
  SVGContents: ({ fill }) => {
    return (
      <path
        d="M28.75 2.5H29.0625C29.5312 2.5 30 2.10938 30 1.5625V0.9375C30 0.46875 29.5312 0 29.0625 0H0.9375C0.390625 0 0 0.46875 0 0.9375V1.5625C0 2.10938 0.390625 2.5 0.9375 2.5H1.25C1.25 9.6875 4.6875 17.6562 11.3281 20C4.60938 22.4219 1.25 30.3906 1.25 37.5H0.9375C0.390625 37.5 0 37.9688 0 38.4375V39.0625C0 39.6094 0.390625 40 0.9375 40H29.0625C29.5312 40 30 39.6094 30 39.0625V38.4375C30 37.9688 29.5312 37.5 29.0625 37.5H28.75C28.75 30.3906 25.2344 22.4219 18.5938 20C25.3125 17.6562 28.75 9.6875 28.75 2.5ZM3.75 2.5H26.25C26.25 11.1719 21.1719 18.125 15 18.125C8.75 18.125 3.75 11.1719 3.75 2.5ZM26.25 37.5H3.75C3.75 28.9062 8.75 21.875 15 21.875C21.1719 21.875 26.25 28.9062 26.25 37.5ZM21.0156 11.4844C21.4844 10.9375 21.0156 10 20.2344 10H9.6875C8.90625 10 8.4375 10.9375 8.90625 11.4844C9.0625 11.7188 9.21875 11.9531 9.45312 12.1875C9.60938 12.4219 9.84375 12.5 10.1562 12.5H19.7656C20.0781 12.5 20.3125 12.4219 20.4688 12.1875C20.7031 11.9531 20.8594 11.7188 21.0156 11.4844ZM7.65625 32.5C7.1875 32.5 6.875 32.8125 6.71875 33.2031C6.71875 33.4375 6.64062 33.6719 6.5625 33.9062C6.48438 34.4531 6.875 35 7.5 35H22.4219C23.0469 35 23.4375 34.4531 23.3594 33.9062C23.2812 33.6719 23.2031 33.4375 23.2031 33.2031C23.0469 32.8125 22.7344 32.5 22.2656 32.5H7.65625Z"
        {...fill}
      />
    );
  },

  viewbox: [0, 0, 30, 40],
};

export const EditEmailLogo: MonochromeIconDefinition = {
  SVGContents: ({ fill }) => {
    return (
      <svg width="46" height="33" viewBox="0 0 46 33" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10.5161 0C7.64187 0 5.31183 2.29241 5.31183 5.12024V8.05406C5.5142 8.12636 5.7082 8.23287 5.88542 8.37448L8.15054 10.1845V7.19799L23.3157 18.1918C24.7073 19.2006 26.6043 19.2006 27.9958 18.1918L43.1613 7.1978V27.4631C43.1613 28.7485 42.1022 29.7905 40.7957 29.7905H10.5161C9.20965 29.7905 8.15054 28.7485 8.15054 27.4631V23.0137L5.31183 20.8036V27.4631C5.31183 30.2909 7.64187 32.5833 10.5161 32.5833H40.7957C43.67 32.5833 46 30.2909 46 27.4631V5.12024C46 2.29241 43.67 0 40.7957 0H10.5161ZM8.46556 3.95903C8.87422 3.26201 9.63949 2.79286 10.5161 2.79286H40.7957C41.6723 2.79286 42.4375 3.26195 42.8462 3.95891C42.8281 3.97085 42.8101 3.98325 42.7923 3.99613L26.3119 15.9434C25.9217 16.2263 25.3898 16.2263 24.9996 15.9434L8.51924 3.99613C8.50154 3.9833 8.48364 3.97093 8.46556 3.95903Z"
          {...fill}
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M3.49991 9.75756L0.347414 13.7419C0.216416 13.9068 0.119234 14.0959 0.0614446 14.2985C0.00365507 14.501 -0.0136044 14.713 0.0106574 14.9223C0.0349192 15.1316 0.100225 15.334 0.202825 15.5179C0.305426 15.7018 0.443301 15.8637 0.608541 15.9941L11.294 24.4657C11.458 24.5983 11.6469 24.6967 11.8494 24.7551C12.052 24.8136 12.2642 24.831 12.4736 24.8062L16.04 24.3919C16.4623 24.3407 16.8474 24.1247 17.1115 23.7909C17.3756 23.4571 17.4974 23.0324 17.4505 22.6092L17.0366 19.0392C17.0127 18.8295 16.9472 18.6267 16.844 18.4427C16.7407 18.2587 16.6018 18.0973 16.4353 17.9678L5.74986 9.49617C5.58558 9.36401 5.3967 9.26586 5.1942 9.20741C4.9917 9.14897 4.77961 9.13139 4.57026 9.15571C4.36091 9.18004 4.15848 9.24577 3.97473 9.34909C3.79098 9.45241 3.62958 9.59125 3.49991 9.75756ZM15.4986 22.5122L12.387 22.8737L4.90718 16.9436L7.65768 13.4673L15.1375 19.3974L15.4986 22.5122ZM6.14391 12.2672L3.39341 15.7434L2.05773 14.6845L4.80823 11.2082L6.14391 12.2672Z"
          {...fill}
        />
      </svg>
    );
  },

  viewbox: [0, 0, 46, 33],
};

export const AlarmIcon: MonochromeIconDefinition = {
  SVGContents: ({ fill = { fill: '#6851FF' } }) => {
    return (
      <path
        d="M24 31.4464C22.9062 31.4464 22.125 32.3041 22.125 33.3177C22.125 34.4094 22.9062 35.1891 24 35.1891C25.0156 35.1891 25.875 34.4094 25.875 33.3177C25.875 32.3041 25.0156 31.4464 24 31.4464ZM23.2969 29.575H24.625C24.9375 29.575 25.25 29.3411 25.25 29.0292L25.7969 18.425C25.7969 18.425 25.7969 18.425 25.7969 18.347C25.7969 18.0351 25.4844 17.7232 25.1719 17.7232H22.75C22.4375 17.7232 22.125 18.0351 22.125 18.347C22.125 18.425 22.125 18.425 22.125 18.425L22.6719 29.0292C22.6719 29.3411 22.9844 29.575 23.2969 29.575ZM6.5 12.7329C6.5 9.30214 9.23438 6.5731 12.75 6.49513C14.1562 6.5731 15.5625 7.04094 16.6562 7.89864C17.5156 7.58674 18.375 7.27485 19.3125 7.11891C17.6719 5.24756 15.3281 4 12.75 4C7.90625 4.07797 4 7.97661 4 12.7329C4 14.7602 4.70312 16.6316 5.875 18.1131C6.26562 17.2554 6.65625 16.3977 7.20312 15.6179C6.73438 14.7602 6.5 13.8246 6.5 12.7329ZM35.25 4C32.5938 4 30.25 5.24756 28.6094 7.11891C29.5469 7.35283 30.4062 7.58674 31.3438 7.97661C32.3594 7.04094 33.7656 6.5731 35.25 6.5731C38.6875 6.5731 41.4219 9.30214 41.5 12.8109C41.4219 13.8246 41.1875 14.7602 40.7188 15.6179C41.2656 16.3977 41.6562 17.2554 42.125 18.1131C43.2188 16.6316 44 14.7602 44 12.7329C43.9219 7.97661 40.0156 4.07797 35.25 4ZM24 8.99025C14.3125 8.99025 6.5 16.8655 6.5 26.4561V26.5341C6.5 30.9006 8.0625 34.8772 10.7188 37.9181L6.65625 41.9727C6.5 42.1287 6.42188 42.2846 6.42188 42.4405C6.42188 42.5965 6.5 42.7524 6.65625 42.9084L7.51562 43.7661C7.67188 43.922 7.82812 43.922 7.98438 43.922C8.14062 43.922 8.29688 43.922 8.375 43.7661L12.5156 39.7115C15.5625 42.3626 19.5469 43.922 23.9219 43.922C28.2969 43.922 32.3594 42.3626 35.4062 39.7115L39.5469 43.7661C39.625 43.922 39.7812 44 39.9375 44C40.0938 44 40.25 43.922 40.4062 43.7661L41.2656 42.9084C41.4219 42.7524 41.4219 42.5965 41.4219 42.4405C41.4219 42.2846 41.4219 42.1287 41.2656 42.0507L37.2031 37.9181C39.8594 34.8772 41.4219 30.9006 41.4219 26.5341C41.4219 26.5341 41.5 26.5341 41.5 26.4561C41.5 16.8655 33.6094 8.99025 24 8.99025ZM24 41.4269C15.7188 41.4269 9 34.7212 9 26.4561C9 18.269 15.7188 11.4854 24 11.4854C32.2031 11.4854 39 18.269 39 26.4561C39 34.7212 32.2031 41.4269 24 41.4269Z"
        {...fill}
      />
    );
  },
  viewbox: [0, 0, 46, 46],
};

export const NetworkIssueIcon: MonochromeIconDefinition = {
  SVGContents: ({ fill = { fill: '#B6B4BA' } }) => {
    return (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20.486 44.5c1.6 0 3.157-.183 4.652-.53-1.018-1.526-1.244-3.573-.244-5.407l4.06-7.442h-.19c.328-1.835.537-3.804.611-5.853h2.77l.568-1.04a5.152 5.152 0 0 1 2.522-2.305h-5.86a42.165 42.165 0 0 0-.61-5.853h6.02c.26 0 .507-.06.727-.166a16.952 16.952 0 0 1 1.863 5.602 5.191 5.191 0 0 1 3.571 1.471c-.54-10.832-9.493-19.45-20.46-19.45-.094 0-.187.001-.28.003a5.014 5.014 0 0 0-.537.014C8.927 3.965.31 12.658.009 23.429a1.694 1.694 0 0 0-.006.26 20.89 20.89 0 0 0-.003.325C0 35.328 9.172 44.5 20.486 44.5ZM13.902 8.258a17.114 17.114 0 0 0-6.223 4.468h4.46c.285-.992.607-1.922.965-2.781.246-.59.512-1.155.798-1.687Zm-8.53 7.812a16.956 16.956 0 0 0-1.83 5.854h7.219c.074-2.05.283-4.018.61-5.854h-6ZM3.46 25.268a16.97 16.97 0 0 0 1.519 5.895c.12-.027.244-.042.372-.042h6.02a42.165 42.165 0 0 1-.61-5.853H3.46Zm3.527 9.198a17.114 17.114 0 0 0 7.56 5.558 17.206 17.206 0 0 1-1.443-2.777 25.49 25.49 0 0 1-.964-2.781H6.987Zm26.306-21.74a17.093 17.093 0 0 0-7.283-4.87c.372.647.713 1.348 1.021 2.089.358.859.681 1.79.965 2.78h5.297ZM19.514 6.969c.322-.018.646-.027.972-.027h.05c.385.113.828.374 1.324.877.718.729 1.441 1.869 2.084 3.412.196.47.38.968.554 1.495h-8.86c.173-.527.358-1.026.554-1.495.643-1.543 1.366-2.683 2.084-3.412.46-.466.874-.725 1.238-.85Zm-5.406 14.955c.082-2.093.314-4.065.667-5.854H25.36c.352 1.789.585 3.76.667 5.854h-11.92Zm.667 9.197a38.166 38.166 0 0 1-.667-5.853h11.92a38.166 38.166 0 0 1-.667 5.853H14.775Zm1.417 4.84c-.196-.47-.38-.969-.554-1.495h8.86a20.753 20.753 0 0 1-.554 1.494c-.643 1.544-1.366 2.684-2.084 3.412-.712.723-1.316.947-1.792.947s-1.08-.224-1.792-.947c-.718-.728-1.441-1.868-2.084-3.412Zm18.883-10.65c1.03-1.888 3.741-1.888 4.771 0l7.818 14.334c.988 1.81-.323 4.019-2.385 4.019H29.642c-2.063 0-3.373-2.208-2.386-4.019l7.819-14.334Zm3.463 4.27c0-.68-.503-1.23-1.123-1.23s-1.122.55-1.122 1.23v4.917c0 .68.502 1.23 1.122 1.23.62 0 1.123-.55 1.123-1.23v-4.917Zm-1.129 8.311a1.684 1.684 0 1 0 0 3.368h.01a1.684 1.684 0 0 0 0-3.368h-.01Z"
        {...fill}
      />
    );
  },
  viewbox: [0, 0, 48, 48],
};
