import { data } from '~/app/services/web-storage/data-api';
import { v4 as createUuid } from 'uuid';
import { encodeBase64URL } from '~/app/libs/base64';
import {
  generateWCKP,
  isJWKValid,
  RELAYER_STORE_KEY_PRIVATE_KEY,
  RELAYER_STORE_KEY_PUBLIC_JWK,
  signatureSHA256Type,
  uint8ToUrlBase64,
} from '~/app/libs/webcrypto/web-crypto';
import { getLogger } from '~/app/libs/datadog';
import { getOptionsFromEndpoint } from '~/app/libs/query-params';
import { Endpoint } from '~/server/routes/endpoint';
import semver from 'semver';
import { SDKType } from '~/app/constants/flags';
import { globalCache } from '~/shared/libs/cache';
import { isEmpty } from '../lodash-utils';

/**
 * @param jwt
 */
export const setDpopHeader = (jwt?: string) => (jwt ? { dpop: jwt } : {});

function shouldOverwriteToIframeDpop(): boolean {
  // For legacy SDK without KP or versions with KP being removed upon logout
  // We should fallback to iframe keys to generate dpop for consistent device profile
  try {
    const { version, sdk } = getOptionsFromEndpoint(Endpoint.Client.SendLegacy);
    const semverVersion = semver.valid(semver.coerce(version));

    if (semverVersion !== null && sdk === SDKType.MagicSDK) {
      return semver.lt(semverVersion, '18.4.0');
    }
  } catch (e) {
    return false;
  }
  return false;
}

export async function createJwtWithIframeKP(jwtFromSDK?: string) {
  if (jwtFromSDK && !shouldOverwriteToIframeDpop()) {
    return jwtFromSDK;
  }

  try {
    let publicJwk: JsonWebKey = await data.getItem(RELAYER_STORE_KEY_PUBLIC_JWK);
    let privateJwk: CryptoKey = await data.getItem(RELAYER_STORE_KEY_PRIVATE_KEY);

    if (!publicJwk || !privateJwk || isEmpty(privateJwk) || !isJWKValid(publicJwk)) {
      await generateWCKP();
    }

    publicJwk = await data.getItem(RELAYER_STORE_KEY_PUBLIC_JWK);
    privateJwk = await data.getItem(RELAYER_STORE_KEY_PRIVATE_KEY);

    if (!privateJwk || isEmpty(privateJwk)) {
      // fetch keyPair from globalCache, return undefined if does not exist
      const keyPair: CryptoKeyPair | undefined = await globalCache.get('kp', async () => undefined);

      if (keyPair) {
        privateJwk = (keyPair as CryptoKeyPair).privateKey;
        publicJwk = await window.crypto.subtle.exportKey('jwk', (keyPair as CryptoKeyPair).publicKey);
      }
    }

    const { subtle } = window.crypto;

    if (!privateJwk || !subtle) {
      getLogger().error('unable to find private key or webcrypto unsupported', {
        jwtFromSDK,
      });
      return jwtFromSDK;
    }

    const claims = {
      iat: Math.floor(new Date().getTime() / 1000),
      jti: createUuid(),
    };

    const headers = {
      typ: 'dpop+jwt',
      alg: 'ES256',
      jwk: publicJwk,
    };

    const jws = {
      protected: encodeBase64URL(JSON.stringify(headers)),
      claims: encodeBase64URL(JSON.stringify(claims)),
    };

    const payload = strToUint8(`${jws.protected}.${jws.claims}`);
    const sig = uint8ToUrlBase64(new Uint8Array(await subtle.sign(signatureSHA256Type, privateJwk, payload)));

    return `${jws.protected}.${jws.claims}.${sig}`;
  } catch {
    return jwtFromSDK;
  }
}

export function strToUint8(str: string) {
  return new TextEncoder().encode(str);
}
