import { HttpService } from '../http';

export const DEFAULT_CLIENT_KMS_ENCRYPT_URL = 'https://nstml1qp8k.execute-api.us-west-2.amazonaws.com/encrypt';
export const DEFAULT_CLIENT_KMS_DECRYPT_URL = 'https://nstml1qp8k.execute-api.us-west-2.amazonaws.com/decrypt';

export const clientKmsEncrypt = async (plaintext: string, kms_encrypt_url: string, jwt: string) => {
  const res = await HttpService.json.post<{ plaintext: string }>(
    kms_encrypt_url,
    { plaintext },
    { headers: { authorization: `Bearer ${jwt}` } },
  );
  return res.data.ciphertext;
};

export const clientKmsDecrypt = async (ciphertext: string, kms_decrypt_url: string, jwt: string) => {
  const res = await HttpService.json.post<{ ciphertext: string }>(
    kms_decrypt_url,
    { ciphertext },
    { headers: { authorization: `Bearer ${jwt}` } },
  );
  return res.data.plaintext;
};
