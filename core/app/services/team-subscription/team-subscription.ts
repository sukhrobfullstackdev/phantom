import { TeamSubscriptionInfo } from '~/shared/types/team-subscription-response';
import { MagicAPIResponse } from '~/shared/types/magic-api-response';
import { HttpService } from '../http';

type GetTeamSubscriptionResponse = MagicAPIResponse<TeamSubscriptionInfo>;

/**
 * Retrieves the magic team subscription information associated with the current API key.
 * This is intended to be called from the iframed context built via the SDK.
 */
export function getTeamSubscription() {
  const endpoint = `v1/core/magic_team/subscription`;
  return HttpService.magic.get<GetTeamSubscriptionResponse>(endpoint);
}
