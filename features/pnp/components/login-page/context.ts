import { createContext, useContext } from 'react';

export interface LoginPageContext {
  providers: string[];
  lastUsedProvider?: string;
  focusedProvider?: string;
  setFocusedProvider: (provider?: string) => void;
  requestInProgress: boolean;
  initiateRequest: () => void;
}

export const LoginPageContext = createContext<LoginPageContext>({
  providers: [],
  requestInProgress: false,
  initiateRequest: () => {},
  setFocusedProvider: () => {},
});

export function useLoginPageContext() {
  return useContext(LoginPageContext);
}
