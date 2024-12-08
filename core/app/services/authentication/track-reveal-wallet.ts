import { HttpService } from '../http';

interface TrackRevealWalletBody {
  auth_user_id: string;
  are_consequences_ack: boolean;
  export_reason: string;
  is_backup: boolean;
}

// NOTE: Despite how this endpoint is named, it does not eject / export the pk at all.
// It just records an audit log for someone who requested to see the key.
export function trackRevealWallet(
  auth_user_id: string,
  are_consequences_ack = true,
  export_reason = '',
  is_backup = true,
) {
  const endpoint = `v1/auth/user/wallet/export`; // Endpoint needs to be renamed.
  const body: TrackRevealWalletBody = {
    auth_user_id,
    are_consequences_ack,
    export_reason,
    is_backup,
  };

  return HttpService.magic.post<TrackRevealWalletBody>(endpoint, body);
}
