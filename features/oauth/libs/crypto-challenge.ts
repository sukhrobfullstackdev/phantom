import CryptoJS from 'crypto-js';
import sha256 from 'crypto-js/sha256';
import { encodeBase64URL } from '~/app/libs/base64';
import { createRandomString } from '~/app/libs/crypto';

type CreateCryptoChallengeReturn = {
  codeVerifier: string;
  challenge: string;
  state: string;
};

/**
 *
 * @param input the sha256 code verifier
 * @returns  base 64 url encoded code verifier challenge hash
 */
function verifierToBase64URL(input: CryptoJS.WordArray) {
  return input.toString(CryptoJS.enc.Base64).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

/**
 * Creates OAuth 2.0-compatible `code_verifier`, `code_challenge`, and `state`
 * parameters.
 */
export function createCryptoChallenge(): CreateCryptoChallengeReturn {
  const state = createRandomString(128);
  const codeVerifier = createRandomString(128);
  const challenge = verifierToBase64URL(sha256(codeVerifier));
  return { codeVerifier, challenge, state };
}
