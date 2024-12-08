import { useMemo, useState } from 'react';
import { parseJWT } from '~/app/libs/base64';
import { createRandomString } from '~/app/libs/crypto';
import { store } from '~/app/store';
import {
  setLoginFactorsRequired,
  setLoginFlowContext,
  setUserEmail,
  setUserID,
  setUST,
} from '~/app/store/auth/auth.actions';
import { AuthThunks } from '~/app/store/auth/auth.thunks';
import { setProfilePictureUrl } from '~/app/store/user/user.actions';
import { loginStartGoogleOauth, loginVerifyGoogleOauth } from '../services/google-login';

type GoogleJwtPayload = {
  aud: string;
  azp: string;
  email: string;
  email_verified: boolean;
  exp: number;
  family_name: string;
  given_name: string;
  iat: number;
  iss: string;
  jti: string;
  name: string;
  nbf: number;
  picture: string;
  sub: string;
};

export const useLoginWithGoogle = () => {
  const [error, setError] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);
  const rom = useMemo(() => createRandomString(128), []);

  const startAndVerifyGoogleLogin = async (token: string) => {
    try {
      setIsLoading(true);
      setError('');

      const { login_flow_context, factors_required } = (await loginStartGoogleOauth(rom, token)).data;
      await store.dispatch(setLoginFlowContext(login_flow_context));
      store.dispatch(setLoginFactorsRequired(factors_required));

      const { auth_user_id, auth_user_session_token } = (await loginVerifyGoogleOauth(rom, login_flow_context)).data;
      store.dispatch(setUserID(auth_user_id));
      store.dispatch(setUST(auth_user_session_token));
      await store.dispatch(AuthThunks.persistSessionCookies(rom));
      await store.dispatch(AuthThunks.populateUserCredentials());

      const jwt = parseJWT(token);
      const payload = jwt.payload as GoogleJwtPayload;
      await store.dispatch(setUserEmail(payload.email));
      await store.dispatch(setProfilePictureUrl(payload.picture));

      return true;
    } catch (e: any) {
      e.getControlFlowError().setUIThreadError();
      setError(e.code);
    } finally {
      setIsLoading(false);
    }
    return false;
  };

  return {
    startAndVerifyGoogleLogin,
    error,
    isLoading,
  };
};
