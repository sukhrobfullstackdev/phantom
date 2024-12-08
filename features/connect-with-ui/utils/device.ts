type BrowserKeys =
  | 'messenger'
  | 'facebook'
  | 'twitter'
  | 'line'
  | 'wechat'
  | 'puffin'
  | 'miui'
  | 'instagram'
  | 'tiktok'
  | 'chrome'
  | 'safari'
  | 'ie'
  | 'firefox';

type Browser = {
  [key in BrowserKeys]: RegExp;
};

const BROWSER: Browser = {
  messenger: /\bFB[\w_]+\/(Messenger|MESSENGER)/,
  facebook: /\bFB[\w_]+\//,
  twitter: /\bTwitter/i,
  line: /\bLine\//i,
  wechat: /\bMicroMessenger\//i,
  puffin: /\bPuffin/i,
  miui: /\bMiuiBrowser\//i,
  instagram: /\bInstagram/i,
  tiktok: /\bBytedance/i,
  chrome: /\bCrMo\b|CriOS|Android.*Chrome\/[.0-9]* (Mobile)?/,
  safari: /Version.*Mobile.*Safari|Safari.*Mobile|MobileSafari/,
  ie: /IEMobile|MSIEMobile/,
  firefox: /fennec|firefox.*maemo|(Mobile|Tablet).*Firefox|Firefox.*Mobile|FxiOS/,
};

export const isInApp = (userAgent: string): boolean => {
  const rules = ['WebView', '(iPhone|iPod|iPad)(?!.*Safari/)', 'Android.*(wv)'];
  const regex = new RegExp(`(${rules.join('|')})`, 'ig');
  return Boolean(userAgent.match(regex));
};

export const getBrowser = (userAgent: string): BrowserKeys | 'other' => {
  const matchedKey = Object.keys(BROWSER).find(key => BROWSER[key].test(userAgent));
  return (matchedKey as BrowserKeys) || 'other';
};

export const isMobile = (userAgent: string): boolean => {
  return /(iPad|iPhone|Android|Mobile)/i.test(userAgent) || false;
};

export const isUnsupportedBrowser = (userAgent: string) => {
  return (
    isInApp(userAgent) &&
    (getBrowser(userAgent) === 'instagram' ||
      getBrowser(userAgent) === 'facebook' ||
      getBrowser(userAgent) === 'tiktok')
  );
};

const isIos = (userAgent: string) => /iP(ad|od|hone)/i.test(userAgent);

export const isIosSafariOrFirefox = (userAgent: string) => {
  const isIosDevice = isIos(userAgent);
  const browser = getBrowser(userAgent);
  const isSafari = browser === 'safari';
  const isFirefox = browser === 'firefox';
  return isIosDevice && (isSafari || isFirefox);
};
