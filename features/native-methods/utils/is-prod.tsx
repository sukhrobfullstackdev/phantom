import { IS_DEPLOY_ENV_DEV, IS_DEPLOY_ENV_STAGEF, IS_NODE_ENV_DEV } from '~/shared/constants/env';

export const isProd = !(IS_NODE_ENV_DEV || IS_DEPLOY_ENV_DEV || IS_DEPLOY_ENV_STAGEF);
