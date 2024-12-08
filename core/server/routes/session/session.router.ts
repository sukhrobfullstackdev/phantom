import { Router } from 'express';
import { SessionEndpoint } from './session.endpoint';
import { persistSession, hydrateSession } from '~/server/middlewares/kms-session';

export const SessionRouter = Router();

SessionRouter.post(SessionEndpoint.Persist, persistSession);
SessionRouter.get(SessionEndpoint.Refresh, hydrateSession);
