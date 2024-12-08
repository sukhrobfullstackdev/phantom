import semver from 'semver';
import { handler } from '~/server/middlewares/handler-factory';
import { withFields } from '~/server/middlewares/with-fields';
import { JSDelivrProxyErrors } from './jsdelivr-proxy-errors';

interface CDNProxyFields {
  v?: string;
}

const withCDNProxyFields = withFields<CDNProxyFields>([], ['v']);

export function createJSDelivrPathRewriter(...sdkNames: string[]) {
  // For greater-than-one SDKs, we combine their paths,
  // pointing all at their latest version.
  if (sdkNames.length > 1) {
    return handler((req, res, next) => {
      const urls = sdkNames.map(sdkName => `npm/${sdkName}@latest`).join(',');
      req.url = `/combine/${urls}`;
      next();
    });
  }

  // For a single SDK, we accept a version parameter (defaulting to latest).
  return withCDNProxyFields(data =>
    handler((req, res, next) => {
      const isVersionValid = !!semver.validRange(data.v);

      if (!!data.v && !isVersionValid) {
        return next(JSDelivrProxyErrors.InvalidVersionIdentifier(data.v));
      }

      req.url = `/npm/${sdkNames[0]}@${isVersionValid ? encodeURIComponent(data.v!) : 'latest'}`;
      next();
    }),
  );
}
