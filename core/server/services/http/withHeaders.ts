import { Request } from 'express';

export function withXForwardedFor(headers: object, req: Request) {
  return {
    ...headers,
    'X-Forwarded-For': req.ip,
  };
}
