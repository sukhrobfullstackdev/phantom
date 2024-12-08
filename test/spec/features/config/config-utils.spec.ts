import { mapLoginProvidersToProvenence, getProviders } from '~/features/config/utils/config-utils';
import { LoginMethodType } from '~/app/constants/flags';

describe('mapLoginProvidersToProvenence', () => {
  test('should return an empty array when given an empty array', () => {
    const result = mapLoginProvidersToProvenence([]);
    expect(result).toEqual([]);
  });

  test('should correctly map "link" to LoginMethodType.EmailLink', () => {
    const providers = ['link'];
    const result = mapLoginProvidersToProvenence(providers);
    expect(result).toEqual([LoginMethodType.EmailLink]);
  });

  test('should correctly map multiple providers', () => {
    const providers = ['link', LoginMethodType.WebAuthn, LoginMethodType.OAuth2, LoginMethodType.SMS];
    const result = mapLoginProvidersToProvenence(providers);
    expect(result).toEqual([
      LoginMethodType.EmailLink,
      LoginMethodType.WebAuthn,
      LoginMethodType.OAuth2,
      LoginMethodType.SMS,
    ]);
  });
});

describe('getProviders', () => {
  test('should return an empty array when no login methods are supported by the SDK', () => {
    const primaryLoginProviders = [];
    const socialLoginProviders = [];
    const sdkSupport = [];
    const result = getProviders(sdkSupport, primaryLoginProviders, socialLoginProviders);
    expect(result).toEqual([]);
  });

  test('should return social login providers when OAuth2 is supported by the SDK', () => {
    const primaryLoginProviders = [];
    const socialLoginProviders = ['google'];
    const sdkSupport = [LoginMethodType.OAuth2];
    const result = getProviders(sdkSupport, primaryLoginProviders, socialLoginProviders);
    expect(result).toEqual(['google']);
  });

  test('should not return social login providers when OAuth2 is not supported by the SDK', () => {
    const primaryLoginProviders = [];
    const socialLoginProviders = ['google'];
    const sdkSupport = [LoginMethodType.EmailLink];
    const result = getProviders(sdkSupport, primaryLoginProviders, socialLoginProviders);
    expect(result).toEqual([]);
  });

  test('should return primary login providers if supported by the sdk', () => {
    const primaryLoginProviders = [
      LoginMethodType.EmailLink,
      LoginMethodType.SMS,
      LoginMethodType.OAuth2,
      LoginMethodType.WebAuthn,
    ];
    const socialLoginProviders = [];
    const sdkSupport = [LoginMethodType.EmailLink, LoginMethodType.SMS, LoginMethodType.OAuth2];
    const result = getProviders(sdkSupport, primaryLoginProviders, socialLoginProviders);
    expect(result).toEqual([LoginMethodType.EmailLink, LoginMethodType.SMS, LoginMethodType.OAuth2]);
  });

  test('should not return primary login providers if not supported by the sdk', () => {
    const primaryLoginProviders = [
      LoginMethodType.EmailLink,
      LoginMethodType.SMS,
      LoginMethodType.OAuth2,
      LoginMethodType.WebAuthn,
    ];
    const socialLoginProviders = [];
    const sdkSupport = [];
    const result = getProviders(sdkSupport, primaryLoginProviders, socialLoginProviders);
    expect(result).toEqual([]);
  });

  test('should return social login providers when OAuth2 is supported by the SDK and return primary login providers if supported by the sdk', () => {
    const primaryLoginProviders = [
      LoginMethodType.EmailLink,
      LoginMethodType.SMS,
      LoginMethodType.OAuth2,
      LoginMethodType.WebAuthn,
    ];
    const socialLoginProviders = ['google'];
    const sdkSupport = [LoginMethodType.EmailLink, LoginMethodType.SMS, LoginMethodType.OAuth2];
    const result = getProviders(sdkSupport, primaryLoginProviders, socialLoginProviders);
    expect(result).toEqual(['google', LoginMethodType.EmailLink, LoginMethodType.SMS, LoginMethodType.OAuth2]);
  });
});
