import { useTheme } from '@magiclabs/ui';
import { useCallback } from 'react';

export const useThemeMode = () => {
  const { isDarkTheme } = useTheme();

  const mode = useCallback(
    (light: string, dark: string, isDark?: boolean) => {
      if (typeof isDark === 'undefined') {
        return isDarkTheme ? dark : light;
      }

      return isDark ? dark : light;
    },
    [isDarkTheme],
  );

  return { mode, isDark: isDarkTheme };
};
