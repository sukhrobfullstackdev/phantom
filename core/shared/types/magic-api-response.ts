export interface MagicAPIResponse<TData = {}> {
  data: TData;
  error_code: string;
  message: string;
  status: 'ok' | 'failed';
}
