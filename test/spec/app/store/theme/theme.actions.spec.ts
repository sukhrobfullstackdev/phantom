import { setTheme } from '~/app/store/theme/theme.actions';

test('setTheme', async () => {
  const action = setTheme({} as any);
  expect(action).toEqual({ type: 'theme/SET_THEME', payload: {} as any });
});
