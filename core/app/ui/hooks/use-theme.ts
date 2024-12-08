import { useCallback } from 'react';
import { Theme, isDefaultTheme as checkDefaultTheme, defaultTheme } from '../../libs/theme';
import { useSelector } from './redux-hooks';

export function useTheme() {
  const theme = useSelector(
    state => state.Theme.theme,
    (left, right) => left.key === right.key,
  );

  /**
   * Equivalent to the `isDefaultTheme` function exported from `libs`, except
   * that the current stateful theme is bound to the first argument.
   */
  const isDefaultTheme = useCallback(
    (key?: keyof Theme) => {
      return checkDefaultTheme(theme, key);
    },
    [theme.key],
  );

  return { theme, isDefaultTheme, defaultTheme };
}
