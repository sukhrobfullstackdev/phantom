import { store } from '../../store';

/**
 * Select a reactive value from Redux state.
 */
export const { useSelector } = store.hooks;

/**
 * Use the global Redux dispatcher.
 */
export const { useDispatch } = store.hooks;

export { shallowEqual } from 'react-redux';
