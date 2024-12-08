export const formatAppName = (appName: string): string => {
  return appName.length > 35 ? `${appName.substring(0, 35)}...` : appName;
};
