import httpProxy, { ServerOptions as ProxyServerOptions } from 'http-proxy';
import type * as http from 'http';
import { Request } from 'express';
import qs from 'qs';

export const proxyServer = httpProxy.createProxyServer();

// Fix proxied POST requests when the default `express`
// body parser is applied before a proxied middleware.
// Adapted from: https://github.com/chimurai/http-proxy-middleware/blob/21c70a0891490d6a65378a5a05c813e38eb877c8/src/handlers/fix-request-body.ts
proxyServer.on('proxyReq', (proxyReq: http.ClientRequest, req: http.IncomingMessage) => {
  const requestBody = (req as Request).body;

  if (!requestBody || !Object.keys(requestBody).length) {
    return;
  }

  const contentType = proxyReq.getHeader('Content-Type') as string;
  const writeBody = (bodyData: string) => {
    proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
    proxyReq.write(bodyData);
  };

  if (contentType && contentType.includes('application/json')) {
    writeBody(JSON.stringify(requestBody));
  }

  if (contentType === 'application/x-www-form-urlencoded') {
    writeBody(qs.stringify(requestBody));
  }
});

export { ProxyServerOptions };
