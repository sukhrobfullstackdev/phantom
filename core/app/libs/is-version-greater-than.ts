import semver from 'semver';
import { getMagicSdkVersion } from './get-magic-sdk-version';

export const isSdkVersionGreaterThanOrEqualTo = (version: string): boolean => {
  const currentVersion = getMagicSdkVersion();
  if (currentVersion) {
    const coercedVersion = semver.coerce(currentVersion);
    if (coercedVersion) return semver.gte(coercedVersion.version, version);
  }
  return true;
};
