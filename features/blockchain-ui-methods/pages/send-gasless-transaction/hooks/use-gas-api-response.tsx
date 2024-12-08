import { useCallback } from 'react';
import { GasApiResponse } from '~/app/services/http/gas-rest';
import { useSharedState } from '~/features/native-methods/hooks/use-shared-data';

export const useGasApiResponse = () => {
  const [gasApiResponse, setGasApiResponse] = useSharedState<GasApiResponse | null>(['gas-api-response'], null);

  const clearGasApiResponse = useCallback(() => {
    setGasApiResponse(null);
  }, []);

  return { gasApiResponse, setGasApiResponse, clearGasApiResponse };
};
