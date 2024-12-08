/**
 * Function for displaying localized strings
 * All strings displayed to the end user should be included here.
 * */

import React from 'react';
import ReactMarkdown from 'react-markdown';
import breaks from 'remark-breaks';
import { currentEndpoint } from '~/app/libs/match-endpoint';
import { Endpoint } from '~/server/routes/endpoint';
import { IS_NODE_ENV_DEV, DEPLOY_ENV, ENVType } from '~/shared/constants/env';
import { escapeMarkdown } from '../escape-markdown';
import { parseLocaleFromPage } from '../load-feature';
import { getOptionsFromEndpoint } from '../query-params';
import { Replacements } from './replacements';
import { Locale, isSupportedLocale } from './supported-locales';
import defaultResource from './en_US';
import { getLogger } from '~/app/libs/datadog';

const i18nModules = {
  'email-preview': {},
  generic: {},
  'login-sms': {},
  login: {},
  mfa: {},
  pnp: {},
  recovery: {},
  'reveal-private-key': {},
  settings: {},
  'update-email': {},
  'update-phone-number': {},
  'verify-device': {},
};
const isLocalOrPreviewRelayerEnv = () => {
  return window.location.href?.startsWith('http://localhost') || window.location.href?.startsWith('https://auth-');
};

const getI18nAssetPath = () => {
  if (DEPLOY_ENV === ENVType.Dev || DEPLOY_ENV === ENVType.Stagef)
    return `https://assets.auth.${DEPLOY_ENV}.magic.link/i18n`;
  return `https://assets.auth.magic.link/i18n`;
};

export const initI18nFiles = async () => {
  let localeStr = getLocaleFromParams().toString();
  if (localeStr.split('_').length === 2) {
    // 'en_us' => 'en_US', 'pl_pl' => 'pl_PL'. Lokalise resource format.
    localeStr = `${localeStr.split('_')[0]}_${localeStr.split('_')[1].toUpperCase()}`;
  }
  Object.keys(i18nModules).forEach(async key => {
    const localStrResourceUri = `${localeStr}/${localeStr}-${key}.json`;

    const fullAssetUrl = `${getI18nAssetPath()}/${localStrResourceUri}`;
    i18nModules[key] = isLocalOrPreviewRelayerEnv()
      ? await import(`../../../../cdn-static/i18n/${localStrResourceUri}`)
      : await (await fetch(fullAssetUrl)).json();
  });
};

export const getTranslationResource = () => Object.assign({}, ...Object.values(i18nModules));

export function getLocaleFromParams(): Locale {
  let endpointInfo: any;
  const route = currentEndpoint();

  switch (route) {
    case Endpoint.Client.SendLegacy:
    case Endpoint.Client.SendV1:
      endpointInfo = getOptionsFromEndpoint(Endpoint.Client.SendLegacy);
      break;

    case Endpoint.Client.ConfirmV1:
      endpointInfo = getOptionsFromEndpoint(Endpoint.Client.ConfirmV1);
      break;

    case Endpoint.Client.LoginV1:
      endpointInfo = getOptionsFromEndpoint(Endpoint.Client.LoginV1);
      break;

    case Endpoint.Client.PreviewV1:
      endpointInfo = getOptionsFromEndpoint(Endpoint.Client.PreviewV1);
      break;

    case Endpoint.Client.ErrorV1:
      endpointInfo = getOptionsFromEndpoint(Endpoint.Client.ErrorV1);
      break;

    default: {
      endpointInfo = {
        locale: parseLocaleFromPage(),
      };
    }
  }

  const localeFromParams = endpointInfo?.locale?.toLowerCase().replace('-', '_');
  return isSupportedLocale(localeFromParams) ? localeFromParams : 'en_us';
}

export class T<Replacements extends string = string> {
  constructor(private readonly key: string = '', private readonly project: string = '') {}

  private getRawTranslation() {
    const locale = getLocaleFromParams();
    const translationKey = `${this.project}.${this.key}`;
    const rawTranslation = getTranslationResource()[translationKey]?.translation;

    if (rawTranslation) return rawTranslation;

    if (IS_NODE_ENV_DEV) {
      getLogger().warn(`No translation string ${translationKey} found for locale ${locale}. Defaulting to \`en_US\`.`);
    }

    return defaultResource[translationKey]?.translation ?? '';
  }

  private processReplacements(translation: string, replacements: Record<Replacements, string> = {} as any) {
    let t = translation;

    for (const k in replacements) {
      if (k) {
        const placeholder = `{${k}}`;
        t = t.replace(placeholder, replacements[k]);
      }
    }

    return t;
  }

  /**
   * Ignoring unit testing this because we haven't bootstraped our react
   * testing flows and this returns a tsx element
   */
  /* istanbul ignore next */
  public toMarkdown(
    replacements: Record<Replacements, string> = {} as any,
    options = {
      shouldEscapeReplacements: true,
      reactMarkdownProps: {},
    },
  ) {
    const replacementsEscaped: typeof replacements = {} as any;

    Object.keys(replacements).forEach(key => {
      // If the replacement contains markdown characters, we assume it's
      // intended to display as plain text, so it must be escaped.
      replacementsEscaped[key] = options.shouldEscapeReplacements
        ? escapeMarkdown(replacements[key])
        : replacements[key];
    });

    const translation = this.processReplacements(this.getRawTranslation(), replacementsEscaped);

    return <ReactMarkdown {...options.reactMarkdownProps} source={translation} plugins={[breaks]} />;
  }

  public toString(replacements: Record<Replacements, string> = {} as any) {
    return this.processReplacements(this.getRawTranslation(), replacements);
  }
}

type TranslationSource = {
  [key: string]: {
    translation: string;
    notes?: string;
  };
};

type TranslationProject<T extends string> = T extends `${infer P}.${string}` ? P : T;
type TranslationKey<T extends string> = T extends `${string}.${infer K}` ? K : T;
type TranslationKeyForProject<I18N extends TranslationSource, P extends string> = TranslationKey<
  Extract<keyof I18N, `${P}.${string}`>
>;

type TranslationModule<I18N extends TranslationSource> = {
  [Project in TranslationProject<Exclude<keyof I18N, number | symbol>>]: {
    [Key in TranslationKeyForProject<I18N, Project>]: `${Project}.${Key}` extends keyof Replacements
      ? T<Replacements[`${Project}.${Key}`]>
      : T;
  };
};

export function createTranslations<I18N extends TranslationSource>(source: I18N): TranslationModule<I18N> {
  const result: any = {};

  Object.keys(source).forEach(key => {
    const [project, translationKey] = key.split('.');

    if (!result[project]) {
      result[project] = {};
    }

    result[project][translationKey] = new T(translationKey, project);
  });

  return result;
}

export const i18n = createTranslations(defaultResource);
