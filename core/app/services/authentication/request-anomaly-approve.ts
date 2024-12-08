import { HttpService } from '../http';
import { MagicAPIResponse } from '~/shared/types/magic-api-response';

type RequestAnomalyApproveResponse = MagicAPIResponse;

export function requestAnomalyApprove(tempLoginToken?: string, env: 'testnet' | 'mainnet' = 'testnet') {
  const endpoint = `v1/request_anomaly/approve?tlt=${tempLoginToken}&e=${env}`;

  return HttpService.magic.post<any, RequestAnomalyApproveResponse>(endpoint, {});
}
