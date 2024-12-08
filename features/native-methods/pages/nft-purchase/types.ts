export interface SardineClientTokenRequestBody {
  reference_id: string;
  nft: {
    name: string;
    image_url: string;
    blockchain_nft_id: string;
    contract_address: string;
    recipient_address: string;
    network: string;
    platform: string;
    type: string;
  };
  identity_prefill?: {
    first_name?: string;
    last_name?: string;
    date_of_birth?: string; // YYYY-MM-DD
    email_address?: string;
    phone?: string;
    address?: {
      street1?: string;
      street2?: string;
      city?: string;
      region_code?: string;
      postal_code?: string;
      country_code?: string;
    };
  };
  is_mainnet: boolean;
}
