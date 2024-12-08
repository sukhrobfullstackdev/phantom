import { isSafari } from './ua-parser';

interface Options {
  title: string;

  left?: number;
  top?: number;

  height: number;
  width: number;

  menubar?: boolean;
  location?: boolean;
  resizable?: boolean;
  scrollbars?: boolean;
  status?: boolean;
}

const defaultOption = {
  menubar: true,
  location: false,
  resizable: true,
  scrollbars: true,
  status: true,
  channelmode: true,
};

export function openPopupWindow(url: string, { title, ...customOptions }: Options) {
  return window.open(url, title, optionToString({ ...defaultOption, ...customOptions }));
}

export function openInNewTab(url: string, features?: string) {
  return window.open(url, isSafari() ? undefined : '_blank', features);
}

function optionToString(options: typeof defaultOption & { width?: number; height?: number }) {
  return Object.entries(options)
    .map(([key, value]) => {
      if (typeof value !== 'boolean') {
        return `${key}=${value}`;
      }
      return value === true ? `${key}=yes` : `${key}=no`;
    })
    .join(',');
}
