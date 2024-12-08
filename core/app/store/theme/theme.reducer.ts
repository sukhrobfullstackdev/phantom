import { ActionType, createReducer } from 'typesafe-actions';
import { defaultTheme, Theme as ITheme } from '../../libs/theme';
import * as ThemeActions from './theme.actions';

/**
 * Overloads `theme.key` with our theme type extensions.
 */
function getThemeKey(theme: ITheme) {
  const themeKeyOverloads = [theme.appName, theme.logoImage, theme.isPreview].join(':');
  return `${theme.key}:${themeKeyOverloads}`;
}

interface ThemeState {
  theme: ITheme;
}

type ThemeActions = ActionType<typeof ThemeActions>;

const initialState: ThemeState = {
  theme: { ...defaultTheme, key: getThemeKey(defaultTheme) },
};

export const Theme = createReducer<ThemeState, ThemeActions>(initialState).handleAction(
  ThemeActions.setTheme,
  (state, action) => ({ ...state, theme: { ...action.payload, key: getThemeKey(action.payload) } }),
);
