/* eslint-disable */

import { decodeBase64 } from './base64';

/**
 * Transforms items in the credentialCreateOptions generated on the server
 * into byte arrays expected by the navigator.credentials.create() call
 * @param {Object} credentialCreateOptionsFromServer
 */
export const transformCredentialCreateOptions = credentialCreateOptionsFromServer => {
  let { challenge, user } = credentialCreateOptionsFromServer;
  user.id = Uint8Array.from(
      decodeBase64(credentialCreateOptionsFromServer.user.id.replace(/\_/g, '/').replace(/\-/g, '+')),
    c => c.charCodeAt(0),
  );

  challenge = Uint8Array.from(
      decodeBase64(credentialCreateOptionsFromServer.challenge.replace(/\_/g, '/').replace(/\-/g, '+')),
    c => c.charCodeAt(0),
  );

  return { ...credentialCreateOptionsFromServer, challenge, user };
};

export const transformCredentialRequestOptions = credentialRequestOptionsFromServer => {
  let { challenge, allowCredentials } = credentialRequestOptionsFromServer;

  challenge = Uint8Array.from(atob(challenge.replace(/\_/g, '/').replace(/\-/g, '+')), c => c.charCodeAt(0));

  allowCredentials = allowCredentials.map(credentialDescriptor => {
    let { id } = credentialDescriptor;
    id = id.replace(/\_/g, '/').replace(/\-/g, '+');
    id = Uint8Array.from(atob(id), c => c.charCodeAt(0));
    return { ...credentialDescriptor, id };
  });

  return  { ...credentialRequestOptionsFromServer, challenge, allowCredentials };
};
