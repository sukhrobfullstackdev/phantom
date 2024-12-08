import { getHeaders } from '~/app/libs/connect-utils';
import { HttpService } from '~/app/services/http';
import { store } from '~/app/store';

interface UserLocation {
  data: {
    country: string;
    country_code: string;
    is_usa: boolean;
    locality: string;
    subdivision: string;
  };
  error_code: string;
  message: string;
  status: 'ok' | 'failed';
}

export const getUserLocation = async () => {
  const userId = store.getState().Auth.userID;
  const endpoint = `/v1/core/auth_user/location?auth_user_id=${userId}`;
  return HttpService.magic.get<UserLocation>(endpoint, getHeaders());
};
