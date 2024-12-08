import { createAction } from 'typesafe-actions';
import { Theme } from '~/app/libs/theme';
import * as actionTypes from './theme.actionTypes';

/**
 * Set a custom theme into Redux state.
 */
export const setTheme = createAction(actionTypes.SET_THEME, (theme: Theme) => theme)();
