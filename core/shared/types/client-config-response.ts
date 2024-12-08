import { WalletSecretManagementInfo } from '~/app/store/system/system.actions';
import { CustomBrandingType, ThemeType } from './theme';

/**
 * This is the interface Magic API uses to represent client config data.
 */
export interface CSPSource {
  client: string;
  client_id: string;
  id: string;
  is_active: boolean;
  time_created: string;
  type: 'connect-src';
  value: string;
}

export interface ClientConfigInfo {
  access_allowlists: {
    bundle: string[];
    domain: string[];
    redirect_url: string[];
  };
  csp_sources: [CSPSource];
  client_theme: {
    app_name: string | undefined;
    asset_uri: string | undefined;
    button_color: string | undefined;
    theme_color: ThemeType | undefined;
    custom_branding_type: CustomBrandingType;
    is_default_asset?: boolean | undefined;
  };
  configured_auth_providers: {
    primary_login_providers: [];
    secondary_login_providers: [];
    social_login_providers: [];
  };
  is_enterprise: boolean;
  product_type: 'magic' | 'connect';
  legacy_redirect: boolean;
  features: {
    is_fiat_onramp_enabled: boolean;
    is_nft_viewer_enabled: boolean;
    is_nft_transfer_enabled: boolean;
    is_send_transaction_ui_enabled: boolean;
    is_signing_ui_enabled: boolean;
    is_gasless_transactions_enabled: boolean;
    is_transaction_confirmation_enabled: boolean;
  };
  is_security_otp_enabled: boolean;
  wallet_secret_management: WalletSecretManagementInfo;
}
