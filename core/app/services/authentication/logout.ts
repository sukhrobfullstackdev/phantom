import { HttpService } from '../http';

interface LogoutBody {
  auth_user_id: string;
}

export async function logout(auth_user_id: string) {
  const endpoint = `v1/auth/user/logout`;

  const body: LogoutBody = {
    auth_user_id,
  };

  await HttpService.magic.post(endpoint, body);
}
