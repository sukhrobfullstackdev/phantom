import { useMemo } from 'react';
import { useTheme } from '~/app/ui/hooks/use-theme';

export const usePrimaryColor = () => {
  const { theme } = useTheme();

  const primaryColor = useMemo(() => {
    return theme.config.primaryColor.toString();
  }, [theme]);

  return { primaryColor };
};
