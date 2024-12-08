import { LoginMethodType } from '~/app/constants/flags';

// TODO(sc45117)
// The response returns values from the backend provenence enum, but we
// need to map these back to the equivalent `LoginMethodType`. This is a
// temporary workaround until the backend provenence enum is updated to align
// with the frontend.
export const mapLoginProvidersToProvenence = (providers: string[]) =>
  providers.map(provenence => (provenence === 'link' ? LoginMethodType.EmailLink : provenence));

export const getProviders = (sdkSupport: string[], primaryLoginProviders: string[], socialLoginProviders: string[]) => {
  return [
    // Even though a login method type may be enabled for the magic
    // client, we need to filter out those methods which are not supported
    // by the PnP SDK currently in use.
    ...(sdkSupport.includes(LoginMethodType.OAuth2) ? socialLoginProviders : []),
    ...primaryLoginProviders.filter(methodType => sdkSupport.includes(methodType)),
  ];
};
