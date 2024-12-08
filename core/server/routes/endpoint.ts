/*
  This module must remain universally compatible between server and browser
  environments. Please ensure all code within this module (including imported
  code) does not rely on unique, environment-specific APIs.
 */

import { ClientEndpoint } from './client/client.endpoint';
import { SessionEndpoint } from './session/session.endpoint';

// Combine endpoint enums
export const Endpoint = {
  Client: ClientEndpoint,
  Session: SessionEndpoint,
};

export type Endpoint = ClientEndpoint | SessionEndpoint;
