import { combineReducers } from 'redux';
import { Awaited } from '~/shared/types/utility-types';
import { GetModelFromReducer } from './types';

export async function getRootReducer() {
  const [{ System }, { Theme }, { User }, { Auth }, { UIThread }, { ActivePayload }] = await Promise.all([
    import('./system/system.reducer'),
    import('./theme/theme.reducer'),
    import('./user/user.reducer'),
    import('./auth/auth.reducer'),
    import('./ui-thread/ui-thread.reducer'),
    import('./active-payload/active-payload.reducer'),
  ]);

  return combineReducers({
    System,
    Theme,
    User,
    Auth,
    UIThread,
    ActivePayload,
  });
}

export type RootReducer = Awaited<ReturnType<typeof getRootReducer>>;
export type RootState = GetModelFromReducer<RootReducer>;
