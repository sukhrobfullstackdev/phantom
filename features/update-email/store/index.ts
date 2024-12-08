import { createStore } from '~/app/store';
import { UpdateEmail } from './update-email.reducer';

export const updateEmailStore = createStore(UpdateEmail, 'update email');
