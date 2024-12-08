import { registrationStart } from './registration-start';
import { register } from './register';
import { unregister } from './unregister';
import { getInfo } from './get-info';
import { update } from './update';
import { webAuthnReAuthStart } from './reauth-start';
import { reauthVerify } from './reauth-verify';
import { registerDeviceStart } from './register-device-start';
import { registerDevice } from './register-device';

export const WebAuthnService = {
  registrationStart,
  register,
  getInfo,
  unregister,
  update,
  webAuthnReAuthStart,
  reauthVerify,
  registerDeviceStart,
  registerDevice,
};
