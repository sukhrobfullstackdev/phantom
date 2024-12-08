import { data } from '~/app/services/web-storage/data-api';
import { strToUint8 } from '~/app/libs/webcrypto/dpop-utils';
import { getLogger } from '~/app/libs/datadog';
import {
  base64ToUint8,
  generateUAKP,
  isWebCryptoSupported,
  RELAYER_STORE_KEY_PUBLIC_UA_PRIVATE,
  RELAYER_STORE_KEY_PUBLIC_UA_PUBLIC,
  signatureSHA256Type,
  uint8ToUrlBase64,
} from '~/app/libs/webcrypto/web-crypto';

export async function signIframeUA() {
  if (!isWebCryptoSupported()) {
    return '';
  }

  try {
    const { subtle } = window.crypto;

    let privateKey: CryptoKey = await data.getItem(RELAYER_STORE_KEY_PUBLIC_UA_PRIVATE);

    if (!privateKey) {
      await generateUAKP();
    }

    privateKey = (await data.getItem(RELAYER_STORE_KEY_PUBLIC_UA_PRIVATE)) as CryptoKey;

    const { userAgent } = navigator;

    const sig = await subtle.sign(signatureSHA256Type, privateKey, strToUint8(userAgent));

    return uint8ToUrlBase64(new Uint8Array(sig));
  } catch (e) {
    getLogger().info('UA signature generated failed', { error: e });
    return '';
  }
}

/**
 * Verify Message signature
 * returns if the message has been signed by the same keypair in the same context
 */
export async function verifyUASig(sig: string): Promise<boolean> {
  if (!isWebCryptoSupported()) {
    return false;
  }

  try {
    const { subtle } = window.crypto;

    if (!(await data.getItem(RELAYER_STORE_KEY_PUBLIC_UA_PUBLIC))) {
      return false;
    }

    const publicKey = (await data.getItem(RELAYER_STORE_KEY_PUBLIC_UA_PUBLIC)) as CryptoKey;

    const { userAgent } = navigator;

    const isVerified = await subtle.verify(signatureSHA256Type, publicKey, base64ToUint8(sig), strToUint8(userAgent));

    return isVerified;
  } catch (e) {
    getLogger().info('UA signature verified failed', { error: e });
    return false;
  }
}
