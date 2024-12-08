import { MonochromeIconDefinition } from '@magiclabs/ui';
import React from 'react';

export const AppleIcon: MonochromeIconDefinition = {
  SVGContents: ({ theme }) => {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M17.452 11.626c-.01-1.803.807-3.162 2.457-4.164-.923-1.322-2.32-2.05-4.16-2.19-1.742-.137-3.648 1.016-4.347 1.016-.737 0-2.424-.968-3.751-.968C4.91 5.362 2 7.504 2 11.862c0 1.287.235 2.617.706 3.987.63 1.803 2.898 6.221 5.264 6.15 1.238-.029 2.113-.878 3.723-.878 1.563 0 2.372.878 3.752.878 2.388-.034 4.44-4.05 5.038-5.86-3.203-1.509-3.03-4.42-3.03-4.513Zm-2.779-8.064C16.013 1.97 15.893.52 15.853 0c-1.185.069-2.555.806-3.335 1.713-.859.973-1.364 2.177-1.256 3.533 1.28.098 2.449-.56 3.411-1.684Z"
          fill={theme.isLightTheme ? 'black' : 'white'}
        />
      </svg>
    );
  },

  viewbox: [0, 0, 24, 24],
};

export const BitbucketIcon: MonochromeIconDefinition = {
  SVGContents: ({ theme }) => {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M1.714 2a.705.705 0 0 0-.705.818l2.992 18.165a.959.959 0 0 0 .938.8h14.355a.704.704 0 0 0 .705-.593L22.99 2.822a.704.704 0 0 0-.705-.817L1.714 2Zm12.6 13.129H9.732l-1.24-6.482h6.932l-1.11 6.482Z"
          fill="#2684FF"
        />
        <path
          d="M22.039 8.647h-6.616l-1.11 6.481H9.731l-5.41 6.422c.172.148.39.23.617.232h14.359A.705.705 0 0 0 20 21.19l2.04-12.543Z"
          fill="url(#a)"
        />
        <defs>
          <linearGradient id="a" x1="23.568" y1="10.462" x2="12.635" y2="18.995" gradientUnits="userSpaceOnUse">
            <stop offset=".18" />
            <stop offset="1" />
          </linearGradient>
        </defs>
      </svg>
    );
  },
  viewbox: [0, 0, 24, 24],
};

export const DiscordIcon: MonochromeIconDefinition = {
  SVGContents: ({ theme }) => {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M20.33 4.523A19.849 19.849 0 0 0 15.38 3a13.61 13.61 0 0 0-.634 1.29 18.439 18.439 0 0 0-5.495 0c-.189-.441-.4-.872-.635-1.29A19.989 19.989 0 0 0 3.66 4.527C.527 9.163-.323 13.684.102 18.141a19.959 19.959 0 0 0 6.073 3.049 14.67 14.67 0 0 0 1.3-2.098 12.907 12.907 0 0 1-2.048-.977c.172-.125.34-.253.502-.378a14.264 14.264 0 0 0 12.142 0c.164.134.332.263.502.378-.654.386-1.34.713-2.052.98.373.733.808 1.434 1.3 2.095a19.869 19.869 0 0 0 6.077-3.047c.498-5.168-.851-9.648-3.568-13.62ZM8.013 15.4c-1.183 0-2.161-1.074-2.161-2.395 0-1.322.944-2.405 2.157-2.405 1.214 0 2.184 1.083 2.164 2.405-.021 1.321-.954 2.395-2.16 2.395Zm7.974 0c-1.186 0-2.16-1.074-2.16-2.395 0-1.322.944-2.405 2.16-2.405 1.215 0 2.178 1.083 2.157 2.405-.02 1.321-.951 2.395-2.157 2.395Z"
          fill={theme.isLightTheme ? '#5865F2' : 'white'}
        />
      </svg>
    );
  },

  viewbox: [0, 0, 24, 24],
};

export const FacebookIcon: MonochromeIconDefinition = {
  SVGContents: ({ theme }) => {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="m16.921 13.4.661-4.312h-4.135V6.291c0-1.179.576-2.33 2.43-2.33h1.881V.291S16.051 0 14.42 0c-3.406 0-5.633 2.063-5.633 5.802v3.286H5V13.4h3.787v10.42a15.235 15.235 0 0 0 4.66 0V13.4h3.474Z"
          fill={theme.isLightTheme ? '#1977F3' : 'white'}
        />
      </svg>
    );
  },

  viewbox: [0, 0, 24, 24],
};

export const GithubIcon: MonochromeIconDefinition = {
  SVGContents: ({ theme }) => {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12.316 0a12.303 12.303 0 0 0-3.89 23.98c.62.113.839-.272.839-.597v-2.092c-3.437.748-4.162-1.654-4.162-1.654a3.293 3.293 0 0 0-1.367-1.805c-1.11-.755.09-.755.09-.755a2.591 2.591 0 0 1 1.881 1.268 2.628 2.628 0 0 0 3.58 1.028 2.613 2.613 0 0 1 .755-1.647c-2.734-.31-5.604-1.367-5.604-6.042a4.758 4.758 0 0 1 1.262-3.3 4.486 4.486 0 0 1 .12-3.256s1.035-.332 3.384 1.262a11.639 11.639 0 0 1 6.163 0c2.349-1.594 3.376-1.262 3.376-1.262a4.464 4.464 0 0 1 .151 3.233 4.758 4.758 0 0 1 1.262 3.3c0 4.728-2.878 5.763-5.62 6.042a2.908 2.908 0 0 1 .839 2.266v3.376c0 .4.219.71.846.59A12.304 12.304 0 0 0 12.316 0Z"
          fill={theme.isLightTheme ? '#191717' : 'white'}
        />
      </svg>
    );
  },

  viewbox: [0, 0, 24, 24],
};

export const GitlabIcon: MonochromeIconDefinition = {
  SVGContents: ({ theme }) => {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="m12.001 22.205 4.05-12.43h-8.1L12 22.205Z" fill="#E24329" />
        <path d="m12.001 22.205-4.05-12.43H2.273l9.728 12.43Z" fill="#FC6D26" />
        <path d="m2.272 9.775-1.23 3.777a.835.835 0 0 0 .304.935L12 22.205 2.272 9.775Z" fill="#FCA326" />
        <path d="M2.273 9.775h5.678L5.51 2.29a.42.42 0 0 0-.798 0l-2.44 7.486Z" fill="#E24329" />
        <path d="m12 22.205 4.05-12.43h5.678L12 22.205Z" fill="#FC6D26" />
        <path d="m21.728 9.775 1.23 3.777a.835.835 0 0 1-.304.935L12 22.205l9.728-12.43Z" fill="#FCA326" />
        <path d="M21.728 9.775H16.05l2.44-7.486a.42.42 0 0 1 .797 0l2.44 7.486Z" fill="#E24329" />
      </svg>
    );
  },

  viewbox: [0, 0, 24, 24],
};

export const GoogleIcon: MonochromeIconDefinition = {
  SVGContents: ({ theme }) => {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M22.556 12.24c0-.904-.073-1.563-.232-2.248H11.997v4.082h6.062c-.122 1.014-.782 2.542-2.249 3.569l-.02.136 3.265 2.53.226.022c2.078-1.918 3.275-4.742 3.275-8.09Z"
          fill="#4285F4"
        />
        <path
          d="M11.999 23c2.97 0 5.463-.978 7.284-2.664l-3.471-2.689c-.929.648-2.176 1.1-3.813 1.1-2.909 0-5.378-1.919-6.258-4.57l-.129.01-3.395 2.628-.044.123C3.982 20.531 7.697 23 11.999 23Z"
          fill="#34A853"
        />
        <path
          d="M5.742 14.177a6.772 6.772 0 0 1-.367-2.175c0-.758.135-1.491.355-2.176l-.007-.145-3.437-2.67-.113.053A11.01 11.01 0 0 0 1 12.002c0 1.772.428 3.446 1.173 4.937l3.569-2.762Z"
          fill="#FBBC05"
        />
        <path
          d="M11.999 5.253c2.065 0 3.458.892 4.253 1.638l3.104-3.031C17.449 2.088 14.968 1 11.999 1 7.697 1 3.982 3.469 2.173 7.062l3.556 2.762C6.621 7.172 9.09 5.253 12 5.253Z"
          fill="#EB4335"
        />
      </svg>
    );
  },

  viewbox: [0, 0, 24, 24],
};

export const LinkedinIcon: MonochromeIconDefinition = {
  SVGContents: ({ theme }) => {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M16.708 20h3.319l.001-5.863c0-2.878-.62-5.09-3.984-5.09-1.284-.048-2.539.617-3.188 1.726v-1.46H9.671V20h3.318v-5.287c0-1.394.265-2.745 1.993-2.745 1.704 0 1.726 1.596 1.726 2.835V20ZM4 5.926c0 1.056.87 1.926 1.926 1.926s1.926-.87 1.926-1.927C7.852 4.87 6.982 4 5.926 4 4.869 4 4 4.87 4 5.926ZM4.263 20h3.322V9.312H4.263V20Z"
          fill={theme.isLightTheme ? '#0A66C2' : 'white'}
        />
      </svg>
    );
  },

  viewbox: [0, 0, 24, 24],
};

export const MicrosoftIcon: MonochromeIconDefinition = {
  SVGContents: ({ theme }) => {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.957 1.957h9.565v9.565H1.957V1.957Z" fill="#F35325" />
        <path d="M12.479 1.957h9.565v9.565h-9.566V1.957Z" fill="#81BC06" />
        <path d="M1.957 12.478h9.565v9.566H1.957v-9.566Z" fill="#05A6F0" />
        <path d="M12.479 12.478h9.565v9.566h-9.566v-9.566Z" fill="#FFBA08" />
      </svg>
    );
  },

  viewbox: [0, 0, 24, 24],
};

export const TwitchIcon: MonochromeIconDefinition = {
  SVGContents: ({ theme }) => {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="m20.857 11.143-3.429 3.428H14l-3 3v-3H7.143V1.715h13.714v9.429Z" fill="#fff" />
        <path
          d="M6.286 0 2 4.286v15.428h5.143V24l4.286-4.286h3.428L22.571 12V0H6.286Zm14.571 11.143L17.43 14.57H14l-3 3v-3H7.143V1.714h13.714v9.429Z"
          fill="#9146FF"
        />
        <path d="M18.286 4.714H16.57v5.143h1.715V4.714Zm-4.714 0h-1.715v5.143h1.715V4.714Z" fill="#9146FF" />
      </svg>
    );
  },

  viewbox: [0, 0, 24, 24],
};

export const TwitterIcon: MonochromeIconDefinition = {
  SVGContents: ({ theme }) => {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M24 4.558a9.848 9.848 0 0 1-2.828.776 4.938 4.938 0 0 0 2.165-2.724 9.861 9.861 0 0 1-3.127 1.194 4.924 4.924 0 0 0-8.39 4.491A13.98 13.98 0 0 1 1.67 3.151a4.902 4.902 0 0 0-.666 2.475c0 1.709.87 3.216 2.19 4.099a4.904 4.904 0 0 1-2.23-.616v.062a4.927 4.927 0 0 0 3.95 4.828 4.93 4.93 0 0 1-2.224.084 4.929 4.929 0 0 0 4.6 3.42 9.88 9.88 0 0 1-6.115 2.107c-.398 0-.79-.023-1.175-.068a13.936 13.936 0 0 0 7.548 2.212c9.057 0 14.01-7.503 14.01-14.01 0-.213-.005-.426-.015-.637A10.007 10.007 0 0 0 24 4.558Z"
          fill="#55ACEE"
        />
      </svg>
    );
  },

  viewbox: [0, 0, 24, 24],
};

export default {
  AppleIcon,
  BitbucketIcon,
  DiscordIcon,
  FacebookIcon,
  GithubIcon,
  GitlabIcon,
  GoogleIcon,
  LinkedinIcon,
  MicrosoftIcon,
  TwitchIcon,
  TwitterIcon,
};
