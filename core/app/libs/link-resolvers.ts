import { includes } from '~/app/libs/lodash-utils';

import { DEPLOY_ENV, ENVType, IS_DEPLOY_ENV_PROD, IS_DEPLOY_ENV_LOCAL } from '~/shared/constants/env';

export const magicUrl = new URL('https://magic.link');

function appendEnvToMagicLink(href: string) {
  let result = new URL(href).href;
  const isMagicHref = includes(href, magicUrl.host);
  const env = IS_DEPLOY_ENV_LOCAL ? ENVType.Dev : DEPLOY_ENV;

  if (isMagicHref && !IS_DEPLOY_ENV_PROD) {
    /* istanbul ignore next */ result = href.replace(magicUrl.host, `${env}.${magicUrl.host}`);
  }

  return result;
}

export function createAnchorTagProps(
  href: string | URL,
): Pick<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'target' | 'rel'> {
  const hrefResolved = href instanceof URL ? href.href : href;

  return {
    href: appendEnvToMagicLink(hrefResolved),
    target: '_blank',
    rel: 'noopener noreferrer',
  };
}

export function createGmailQueryLink(from?: string) {
  const defaultFrom = '@trymagic';
  const encodedFrom = encodeURIComponent(`from:${defaultFrom}`);
  const encodedLocation = encodeURIComponent('in:anywhere');
  return createAnchorTagProps(`https://mail.google.com/mail/u/0/#search/${encodedFrom}+${encodedLocation}`);
}

export const outlookLink = createAnchorTagProps('https://outlook.live.com/mail/0/inbox');

export const magicLandingPageLink = createAnchorTagProps(magicUrl);
