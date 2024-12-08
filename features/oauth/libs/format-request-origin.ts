import { format } from 'url';
import { Request } from 'express';

/**
 * From the given `req`, return the formatted URL origin string, like this:
 * `[protocol]://[...subdomains].[tld]/`.
 */
export function getRequestOrigin(req: Request) {
  const host = req.get('host')?.replace('legacy', 'auth');
  return format({
    protocol: req.protocol,
    host,
  });
}
