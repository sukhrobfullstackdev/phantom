import uuid from 'uuid/v4';
import { Web3Service } from '../web3';
import { generateUserId } from '../../libs/generate-user-id';
import { encodeBase64 } from '~/app/libs/base64';

export async function createDIDToken(options: {
  account: { address: string; privateKey?: string };
  subject: string;
  audience: string;
  lifespan: number;
  attachment?: string;
  systemClockOffset?: number;
}): Promise<string> {
  const { account, subject, audience, lifespan, attachment, systemClockOffset = 0 } = options;
  const utcTimeSecs = Math.floor(Date.now() / 1000) + Math.floor(systemClockOffset / 1000);

  const claim = JSON.stringify({
    iat: utcTimeSecs,
    ext: utcTimeSecs + lifespan,
    iss: generateUserId(account.address),
    sub: subject,
    aud: audience,
    nbf: utcTimeSecs,
    tid: uuid(),
    add: Web3Service.personalSign(attachment || 'none', account.privateKey),
  });

  // The final token is an encoded string containing a JSON tuple: [proof, claim]
  // proof should be a signed claim, if correct.
  const proof = Web3Service.personalSign(claim, account.privateKey);
  return encodeBase64(JSON.stringify([proof, claim]));
}
