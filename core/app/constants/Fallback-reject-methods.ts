import { ETH_SIGN, ETH_SIGNTRANSACTION, ETH_SIGNTYPEDDATA } from '~/app/constants/eth-rpc-methods';

/**
 * Fallback and reject methods config for Globally scoped apps
 */
export const FallbackAndRejectMethods = {
  GlobalScope: {
    GLOBAL_SCOPE_REJECTED_METHODS: new Set<string>([ETH_SIGNTRANSACTION, ETH_SIGN, ETH_SIGNTYPEDDATA]),
  },
} as const;
