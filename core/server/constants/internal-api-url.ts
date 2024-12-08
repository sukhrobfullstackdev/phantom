import { BACKEND_URL, ENVType } from '~/shared/constants/env';

export const INTERNAL_API_URL = {
  [ENVType.Dev]: process.env.INTERNAL_BACK_URL ?? 'https://api-a.dev.magic-corp.link',
  [ENVType.Stagef]: process.env.INTERNAL_BACK_URL ?? 'https://api-a.stagef.magic-corp.link',
  [ENVType.PreviewDeployments]: process.env.INTERNAL_BACK_URL ?? 'https://api-a.stagef.magic-corp.link',
  [ENVType.Prod]: process.env.INTERNAL_BACK_URL ?? 'https://api-a.prod.magic-corp.link',
  [ENVType.Local]: BACKEND_URL,
} as const;
