import { MagicAPIResponse } from '~/shared/types/magic-api-response';
import { HttpService } from '~/app/services/http';

export function getUnsuportedCountries(apiKey: string) {
  const endpoint = `/v1/phone/countries/unsupported`;
  return HttpService.magic.get<MagicAPIResponse<string[]>>(endpoint, {
    headers: {
      'x-magic-api-key': apiKey,
    },
  });
}
