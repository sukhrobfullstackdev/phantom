import { createStore } from '~/app/store';
import { LoginWithSms } from './login-with-sms.reducer';

export const smsLoginStore = createStore(LoginWithSms, 'sms');
