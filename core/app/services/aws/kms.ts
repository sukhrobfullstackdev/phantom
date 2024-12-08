import { KMSClient, EncryptCommand, DecryptCommand } from '@aws-sdk/client-kms';
import { Credentials } from '@aws-sdk/types';
import { CognitoIdentityClient, GetCredentialsForIdentityCommand } from '@aws-sdk/client-cognito-identity';
import { base64BinaryToUint8Array } from '../../libs/decode-uint-array';
import { SHA256 } from '~/app/libs/crypto';
import { GET_CREDENTIALS_PROXY_URL } from '~/shared/constants/env';
import { DelegatedWalletInfo } from '../../types/delegated-wallet-types';

const region = 'us-west-2';

async function getCredentials(delegatedWalletInfo?: DelegatedWalletInfo, systemClockOffset = 0) {
  if (!delegatedWalletInfo?.delegated_access_token) {
    throw new Error('DKMS - Missing delegated access token');
  }

  const body = {
    IdentityId: delegatedWalletInfo.delegated_identity_id,
    Logins: {
      'cognito-identity.amazonaws.com': delegatedWalletInfo.delegated_access_token,
    },
  };

  const bodySHA = SHA256.digest(JSON.stringify(body));
  const client = new CognitoIdentityClient({
    region: 'us-west-2',
    systemClockOffset,
    endpoint: `${GET_CREDENTIALS_PROXY_URL}/get-credentials/${bodySHA}`,
  });
  const command = new GetCredentialsForIdentityCommand(body);

  try {
    const res = await client.send(command);

    return {
      accessKeyId: res?.Credentials?.AccessKeyId,
      secretAccessKey: res?.Credentials?.SecretKey,
      sessionToken: res?.Credentials?.SessionToken,
      expiration: res?.Credentials?.Expiration,
    } as Credentials;
  } catch (err: any) {
    const errorStrings = Object.keys(err?.$metadata).map(key => `${key}: ${JSON.stringify(err[key])}`);
    errorStrings.push(`name: ${err?.name}, message: ${err?.message}, status: ${err?.status}, code: ${err?.code}`);
    errorStrings.push(`JSON String: ${JSON.stringify(err)}`);
    if (err?.$metadata) {
      Object.keys(err.$metadata).forEach(key => errorStrings.push(`${key}: ${JSON.stringify(err.$metadata[key])}`));
    }
    const message = `DKMS - Error fetching credentials region: us-west-2, endpoint: ${GET_CREDENTIALS_PROXY_URL}/get-credentials/${bodySHA}, bodySHA: ${bodySHA.toString()} ${errorStrings.join(
      ' ',
    )}`;
    throw new Error(message);
  }
}

export async function kmsEncrypt(data?: string, delegatedWalletInfo?: DelegatedWalletInfo, systemClockOffset = 0) {
  if (!data) {
    throw new Error('DKMS - missing encrypted private key');
  }

  const credentials = await getCredentials(delegatedWalletInfo, systemClockOffset);

  const kms = new KMSClient({
    region,
    credentials,
  });
  const encryptCommand = new EncryptCommand({
    KeyId: delegatedWalletInfo?.delegated_key_id,
    Plaintext: Buffer.from(data),
  });
  const result = await kms.send(encryptCommand);

  if (!result.CiphertextBlob) {
    throw new Error('DKMS - Failed encryption');
  }
  return Buffer.from(result.CiphertextBlob).toString('base64');
}

export async function kmsDecrypt(data?: string, delegatedWalletInfo?: DelegatedWalletInfo, systemClockOffset = 0) {
  const credentials = await getCredentials(delegatedWalletInfo, systemClockOffset);

  const kms = new KMSClient({
    region,
    credentials,
  });
  const decryptCommand = new DecryptCommand({
    CiphertextBlob: base64BinaryToUint8Array(data),
  });
  const result = await kms.send(decryptCommand);

  if (!result.Plaintext) {
    throw new Error('DKSM - Failed decryption');
  }
  return Buffer.from(result.Plaintext).toString('ascii');
}
