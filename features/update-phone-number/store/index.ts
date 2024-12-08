import { createStore } from '~/app/store';
import { UpdatePhoneNumber } from './update-phone-number.reducer';

export const updatePhoneNumberStore = createStore(UpdatePhoneNumber, 'update phone');
