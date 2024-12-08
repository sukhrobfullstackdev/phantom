import metadata from 'libphonenumber-js/metadata.min.json';
import parse, { AsYouType, CountryCode } from 'libphonenumber-js/min';
import countries, { Alpha2Code } from 'i18n-iso-countries';

// I18N locales
// ------------
// These have to be maually registered!
// We just use EN for now; we'll add more locales
// when we figure out a good way to do it async...
import i18nISO_en from 'i18n-iso-countries/langs/en.json';

countries.registerLocale(i18nISO_en);

export type CountryCodeOption = {
  key: Alpha2Code;
  callingCode: string;
  name: string;
  searchableName: string;
};

/**
 * Gets metadata for a country given by it's ISO Alpha-2 code, returning the
 * calling code, country name, and a searchable name (which is really just
 * `name.toLowerCase()`).
 *
 * Read about Alpha-2 codes: https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2
 */
export function getCountryMetadata(alpha2Code: Alpha2Code): CountryCodeOption | undefined {
  if (countries.isValid(alpha2Code) && !!metadata.countries[alpha2Code]) {
    const [callingCode] = metadata.countries[alpha2Code] as [string];
    const name = countries.getName(alpha2Code, 'en');
    return { key: alpha2Code, callingCode, name, searchableName: name.toLowerCase() };
  }
}

/**
 * Parse a phone number by it's country code.
 */
export function parsePhoneNumber(alpha2Code?: Alpha2Code, phoneNumber?: string) {
  if (alpha2Code && phoneNumber) {
    if (countries.isValid(alpha2Code) && !!metadata.countries[alpha2Code]) {
      return parse(phoneNumber, alpha2Code as CountryCode);
    }
  }
}

/**
 * Formats a phone number to a localized, prettified value by it's country code.
 */
export function asYouType(alpha2Code?: Alpha2Code, phoneNumber?: string) {
  if (alpha2Code && phoneNumber) {
    if (countries.isValid(alpha2Code) && !!metadata.countries[alpha2Code]) {
      return new AsYouType(alpha2Code as CountryCode).input(phoneNumber);
    }
  }
}

/**
 * All country metadatas gleaned from `libphonenumber-js`.
 */
export const countryCodeOptions: CountryCodeOption[] = ((Object.keys(countries.getAlpha2Codes()) as Alpha2Code[])
  .map(getCountryMetadata)
  .filter(Boolean) as CountryCodeOption[]).sort((a: CountryCodeOption, b: CountryCodeOption) => {
  // Sort alphabetically by country name.
  if (a.name < b.name) return -1;
  if (a.name > b.name) return 1;
  return 0;
});

export type { Alpha2Code };
