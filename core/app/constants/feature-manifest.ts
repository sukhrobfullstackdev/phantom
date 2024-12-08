import type { ClientSideFeatureManifestData } from '~/features/framework';

export const manifest: ClientSideFeatureManifestData = window.__auth_relayer_manifest__
  ? window.__auth_relayer_manifest__
  : ({ features: {} } as ClientSideFeatureManifestData);
