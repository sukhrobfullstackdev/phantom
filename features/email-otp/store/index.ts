import { createStore } from '~/app/store';
import { LoginWithEmailOtpReducer } from './email-otp.reducer';

export const loginWithEmailOtpStore = createStore(LoginWithEmailOtpReducer, 'email otp');
