export const AllowedHeaders = [
  'content-type',
  'authorization',
  'x-amzn-trace-id',
  'x-magic-trace-id',
  'x-magic-api-key',
  'x-magic-bundle-id',
  'x-magic-referrer',
  'x-magic-csrf',
  'x-magic-sdk',
  'x-magic-sdk-version',
  'x-custom-authorization-token',
] as const;

export type AllowedHeaders = (typeof AllowedHeaders)[number];

export type IncomingAuthRelayerHeaders = { [P in AllowedHeaders]?: string };

/**
 * Enables the `AllowedHeaders` list to be used wherever `string[]` is used.
 */
export const allowedHeadersList = AllowedHeaders as unknown as AllowedHeaders[];
