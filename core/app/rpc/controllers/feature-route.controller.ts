import {
  ETH_ACCOUNTS,
  ETH_REQUESTACCOUNTS,
  ETH_SEND_GASLESS_TRANSACTION,
  ETH_SENDTRANSACTION,
  ETH_SIGNTYPEDDATA_V3,
  ETH_SIGNTYPEDDATA_V4,
  PERSONAL_SIGN,
} from '~/app/constants/eth-rpc-methods';
import {
  MAGIC_AUTH_GET_METADATA,
  MAGIC_DISCONNECT,
  MAGIC_GET_INFO,
  MAGIC_IS_LOGGED_IN,
  MAGIC_SHOW_ADDRESS,
  MAGIC_SHOW_BALANCES,
  MAGIC_SHOW_FIAT_ONRAMP,
  MAGIC_SHOW_NFTS,
  MAGIC_SHOW_SEND_TOKENS_UI,
  MAGIC_WALLET,
  MagicAuthIsLoggedIn,
  MagicAuthLogout,
  MC_DISCONNECT,
  MC_WALLET,
} from '~/app/constants/route-methods';
import { getClientFeatureFlags, isGlobalAppScope } from '~/app/libs/connect-utils';
import { sdkErrorFactories } from '~/app/libs/exceptions';
import { routeJsonRpcMethod } from '..';
import { RpcMiddleware } from '../types';
import { rejectPayload } from '../utils';
import { isETHWalletType } from '~/app/libs/network';
import { FallbackAndRejectMethods } from '~/app/constants/Fallback-reject-methods';
import { AnalyticsActionType, trackAction } from '~/app/libs/analytics';
import { FLOW_GETACCOUNT, FLOW_SIGNMESSAGE, FLOW_SIGNTRANSACTION } from '~/app/constants/flow-rpc-methods';

const FlowTransactionRpcMethods = [FLOW_SIGNTRANSACTION, FLOW_SIGNMESSAGE];
const FlowAccountMethods = [FLOW_GETACCOUNT];

const EthSignMethods = [PERSONAL_SIGN, ETH_SIGNTYPEDDATA_V3, ETH_SIGNTYPEDDATA_V4];
const EthTransactionMethods = [ETH_SENDTRANSACTION];
const EthAccountMethods = [ETH_ACCOUNTS, ETH_REQUESTACCOUNTS];
const EthGasMethods = [ETH_SEND_GASLESS_TRANSACTION];

export const EthRpcMethodRerouteMapping = {
  [ETH_SIGNTYPEDDATA_V3]: `mwui_${ETH_SIGNTYPEDDATA_V3}`,
  [ETH_SIGNTYPEDDATA_V4]: `mwui_${ETH_SIGNTYPEDDATA_V4}`,
  [PERSONAL_SIGN]: `mwui_${PERSONAL_SIGN}`,
  [ETH_SENDTRANSACTION]: `mwui_${ETH_SENDTRANSACTION}`,
  [ETH_REQUESTACCOUNTS]: `mwui_${ETH_REQUESTACCOUNTS}`,
  [ETH_ACCOUNTS]: `mwui_${ETH_ACCOUNTS}`,
  [ETH_SEND_GASLESS_TRANSACTION]: `mwui_${ETH_SEND_GASLESS_TRANSACTION}`,
};

const FlowRpcMethodRerouteMapping = {
  [FLOW_GETACCOUNT]: `mwui_${FLOW_GETACCOUNT}`,
  [FLOW_SIGNTRANSACTION]: `mwui_${FLOW_SIGNTRANSACTION}`,
  [FLOW_SIGNMESSAGE]: `mwui_${FLOW_SIGNMESSAGE}`,
};

const MagicMethodRerouteMapping = {
  [MAGIC_AUTH_GET_METADATA]: MAGIC_GET_INFO,
  [MagicAuthIsLoggedIn]: MAGIC_IS_LOGGED_IN,
  [MagicAuthLogout]: MAGIC_DISCONNECT,
  /* TODO: These two currently dont work because magicRerouteRPC isn't called for feature framework level features */
  [MC_DISCONNECT]: MAGIC_DISCONNECT,
  [MC_WALLET]: MAGIC_WALLET,
};

// Returns true if method was updated.
// TODO: Unit test this
const UpdateRpcPayloadMethodForReroute = (payload, flags?) => {
  // Update payload method for supported eth methods
  const payloadMethod = payload.method as string;
  if (
    (EthSignMethods.includes(payloadMethod) && flags?.is_signing_ui_enabled) ||
    (EthTransactionMethods.includes(payloadMethod) && flags?.is_send_transaction_ui_enabled) ||
    (EthGasMethods.includes(payloadMethod) &&
      flags?.is_gasless_transactions_enabled &&
      flags?.is_send_transaction_ui_enabled) ||
    EthAccountMethods.includes(payloadMethod)
  ) {
    payload.method = EthRpcMethodRerouteMapping[payload.method];
    return true;
  }
  // Update payload method for supported flow methods
  if (
    (FlowTransactionRpcMethods.includes(payloadMethod) && flags?.is_send_transaction_ui_enabled) ||
    (FlowAccountMethods.includes(payloadMethod) && isGlobalAppScope())
  ) {
    payload.method = FlowRpcMethodRerouteMapping[payload.method];
    return true;
  }
  // Update payload method for supported magic methods
  if (MagicMethodRerouteMapping[payload.method]) {
    payload.method = MagicMethodRerouteMapping[payload.method];
    return true;
  }

  return false;
};

export const multiChainRerouteRPC: RpcMiddleware = ({ payload }, next) => {
  const clientFeatureFlags = getClientFeatureFlags();
  if (!isETHWalletType() && UpdateRpcPayloadMethodForReroute(payload, clientFeatureFlags)) {
    routeJsonRpcMethod(payload);
  } else {
    next();
  }
};

export const ethRerouteRPC: RpcMiddleware = ({ payload }, next) => {
  const clientFeatureFlags = getClientFeatureFlags();
  if (isGlobalAppScope()) {
    if (FallbackAndRejectMethods.GlobalScope.GLOBAL_SCOPE_REJECTED_METHODS.has(payload.method)) {
      return rejectPayload(payload, sdkErrorFactories.web3.unsupportedEVMMethodForGlobalWalletApps(payload.method));
    }
  }
  if (UpdateRpcPayloadMethodForReroute(payload, clientFeatureFlags)) {
    routeJsonRpcMethod(payload);
  } else {
    next();
  }
};
export const magicRerouteRPC: RpcMiddleware = ({ payload }, next) => {
  if (UpdateRpcPayloadMethodForReroute(payload)) {
    routeJsonRpcMethod(payload);
  } else {
    next();
  }
};

export const ifGlobalAppScopeRejectMagicRPC: RpcMiddleware = ({ payload }, next) => {
  if (isGlobalAppScope() && payload.method !== 'magic_intermediary_event') {
    rejectPayload(payload, sdkErrorFactories.magic.unsupportedSDKMethodForGlobalWalletApps());
  } else {
    next();
  }
};

const RpcMethodToToggleMapping = {
  [MAGIC_SHOW_FIAT_ONRAMP]: 'is_fiat_onramp_enabled',
  [MAGIC_SHOW_NFTS]: 'is_nft_viewer_enabled',
};

const RpcMethodToSDKNameMapping = {
  [MAGIC_SHOW_FIAT_ONRAMP]: 'wallet.showOnRamp',
  [MAGIC_SHOW_NFTS]: 'wallet.showNFTs',
  [MAGIC_SHOW_BALANCES]: 'wallet.showBalances',
  [MAGIC_SHOW_SEND_TOKENS_UI]: 'wallet.showSendTokensUI',
  [MAGIC_SHOW_ADDRESS]: 'wallet.showAddress',
};

export const rejectIfWalletUINotEnabled: RpcMiddleware = ({ payload }, next) => {
  const { method } = payload;
  const clientFeatureFlags = getClientFeatureFlags();
  if (RpcMethodToToggleMapping[method] && !clientFeatureFlags[RpcMethodToToggleMapping[method]]) {
    trackAction(AnalyticsActionType.WalletUINotEnabled, {
      method,
    });
    rejectPayload(payload, sdkErrorFactories.web3.walletUINotEnabledForApp(RpcMethodToSDKNameMapping[method]));
  } else {
    next();
  }
};
