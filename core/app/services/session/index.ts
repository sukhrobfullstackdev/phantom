import { sessionPersist } from './persist';
import { sessionRefresh } from './refresh';

export const SessionService = {
  persist: sessionPersist,
  refresh: sessionRefresh,
};
