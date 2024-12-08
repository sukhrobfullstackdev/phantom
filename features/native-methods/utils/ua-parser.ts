import UAParser from 'ua-parser-js';
import { isInApp } from '~/features/connect-with-ui/utils/device';

export const isSafari = () => {
  const parser = new UAParser();
  const userAgentInfo = parser.getResult();

  return userAgentInfo.browser.name === 'Safari';
};

export const isMobileSafariOrFirefox = () => {
  const parser = new UAParser();
  const userAgentInfo = parser.getResult();

  return (
    userAgentInfo.browser.name === 'Safari' ||
    userAgentInfo.browser.name === 'Mobile Safari' ||
    userAgentInfo.browser.name === 'Firefox'
  );
};

export const isInAppBrowser = () => {
  const parser = new UAParser();
  const browser = parser.getBrowser();

  return (
    isInApp(parser.getUA()) ||
    (browser.name &&
      [
        'TickTok',
        'Instagram',
        'Facebook',
        'Twitter',
        'Line',
        'WeChat',
        'Weibo',
        'QQ',
        'KakaoTalk',
        'KakaoStory, ',
      ].includes(browser.name))
  );
};
