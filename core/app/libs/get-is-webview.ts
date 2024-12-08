export const getIsWebview = (userAgent: string): boolean => {
  return /webview|wv|ip((?!.*Safari)|(?=.*like Safari))/i.test(userAgent);
};
