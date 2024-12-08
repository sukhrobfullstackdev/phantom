export * from './device-approved';
export * from './device-link-expired';
export * from './device-registration';
export * from './device-rejected';
export * from './device-verifying';

export interface DeviceMetadata {
  device_id: string;
  origin: string;
  browser: string;
  os: string;
  ua_sig: string;
  email: string;
  device_ip?: string;
}
