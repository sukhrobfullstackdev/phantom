import { HttpService } from '../http';
import { MagicAPIResponse } from '~/shared/types/magic-api-response';

type RequestAnomalyBlockResponse = MagicAPIResponse<{
  role?: {
    is_admin?: boolean;
  };
}>;

export function requestAnomalyBlock(tempLoginToken?: string, env: 'testnet' | 'mainnet' = 'testnet') {
  const endpoint = `v1/request_anomaly/block?tlt=${tempLoginToken}&e=${env}`;

  return HttpService.magic.post<any, RequestAnomalyBlockResponse>(endpoint, {});
}
