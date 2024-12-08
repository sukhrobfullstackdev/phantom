export const sendNewEmailConfirmationLinkActions = [
  {
    type: 'updateEmail/SET_UPDATE_EMAIL_STEP',
    payload: 'CONFIRM_NEW_EMAIL',
  },
  {
    type: 'updateEmail/SET_UPDATE_EMAIL_JWT',
    payload: 'TEST_JWT_TOKEN',
  },
  { type: 'updateEmail/SET_UPDATE_REQUEST_ID', payload: 'REQUEST_ID' },
];

export const sendNewEmailConfirmationLinkErrorActions = [
  {
    payload: 'CONFIRM_NEW_EMAIL',
    type: 'updateEmail/SET_UPDATE_EMAIL_STEP',
  },
];

export const waitForEmailConfirmationLinksClickedStatusOldEmailSentActions = [
  {
    payload: 'CONFIRM_CURRENT_EMAIL',
    type: 'updateEmail/SET_UPDATE_EMAIL_STEP',
  },
  {
    payload: 'CONFIRM_CURRENT_EMAIL',
    type: 'updateEmail/SET_UPDATE_EMAIL_STEP',
  },
];

export const waitForEmailConfirmationLinksClickedStatusIsCompletedActions = [
  {
    payload: 'test@magic.link',
    type: 'auth/SET_USER_EMAIL',
  },
];

export const waitForEmailConfirmationLinksClickedStatusIsCompletedActionsWithEmptyEmail = [
  {
    payload: '',
    type: 'auth/SET_USER_EMAIL',
  },
];
