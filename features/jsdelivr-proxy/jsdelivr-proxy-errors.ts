import { createHttpError } from '~/server/libs/exceptions';

export const JSDelivrProxyErrors = {
  InvalidVersionIdentifier: (receivedValue: string) =>
    createHttpError({
      status: 400,
      errorCode: 'auth_relayer/INVALID_VERSION_IDENTIFIER',
      message: `Failed to parse the provided version identifier. Received: ${receivedValue}`,
    }),
};
