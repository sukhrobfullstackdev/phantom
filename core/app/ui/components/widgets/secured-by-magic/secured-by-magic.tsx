import React, { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Linkable } from '@magiclabs/ui';
import { trackAction, AnalyticsActionType } from '~/app/libs/analytics';
import { matchEndpoint } from '~/app/libs/match-endpoint';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { Endpoint } from '~/server/routes/endpoint';
import { getLocaleFromParams } from '~/app/libs/i18n';
import { isMobileSDK } from '~/app/libs/platform';

import styles from './secured-by-magic.less';

interface SecuredByMagicProps {
  faded?: boolean;
  small?: boolean;
  noLink?: boolean;
}

export const SecuredByMagic: React.FC<SecuredByMagicProps> = ({ faded, small, noLink }) => {
  const location = useLocation();
  const { theme } = useTheme();

  const trackFooterLinkNavigation = useCallback(() => {
    if (
      matchEndpoint(location.pathname, Endpoint.Client.SendV1) ||
      matchEndpoint(location.pathname, Endpoint.Client.SendLegacy)
    ) {
      trackAction(AnalyticsActionType.PendingModalFooterLinkClicked, { app_name: theme.appName });
    } else if (
      matchEndpoint(location.pathname, [
        Endpoint.Client.ConfirmV1,
        Endpoint.Client.LoginV1,
        Endpoint.Client.ConfirmEmailV1,
      ])
    ) {
      trackAction(AnalyticsActionType.ConfirmPageFooterLinkClicked, { app_name: theme.appName });
    } else if (matchEndpoint(location.pathname, Endpoint.Client.ConfirmNFTTransferV1)) {
      trackAction(AnalyticsActionType.NFTTransferFooterLinkClicked, { app_name: theme.appName });
    }
  }, [location, theme.key]);

  const logoScale = small ? 0.75 : 1.2;

  const logoSVG = (
    <svg width={83 * logoScale} height={31 * logoScale} viewBox="0 0 83 31" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient
          className={styles.logoGradient}
          id="logo-gradient"
          x1="0.666687"
          y1="14.5"
          x2="68"
          y2="14.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#402FC3" />
          <stop offset="1" stopColor="#C970FF" />
        </linearGradient>
      </defs>

      <path d="M45.1797 20.8929H47.7932V8.70022H44.1379L41.1771 16.3047L38.2163 8.70022H34.5792V20.8929H37.1745V12.1186L40.6105 20.8929H41.7437L45.1797 12.1186V20.8929Z" />
      <path d="M55.4597 20.8929H57.7808V15.1896C57.7808 12.6487 55.9349 11.8444 53.9245 11.8444C52.5354 11.8444 51.1464 12.2831 50.0681 13.2336L50.9454 14.7874C51.6947 14.0928 52.572 13.7455 53.5224 13.7455C54.6921 13.7455 55.4597 14.3304 55.4597 15.2262V16.4509C54.8748 15.738 53.8331 15.3724 52.6634 15.3724C51.2561 15.3724 49.5929 16.1219 49.5929 18.1875C49.5929 20.1617 51.2561 21.1123 52.6634 21.1123C53.8148 21.1123 54.8566 20.6918 55.4597 19.9789V20.8929ZM55.4597 18.7725C55.0759 19.2843 54.3448 19.5402 53.5955 19.5402C52.6816 19.5402 51.9323 19.0649 51.9323 18.2423C51.9323 17.4015 52.6816 16.9079 53.5955 16.9079C54.3448 16.9079 55.0759 17.1638 55.4597 17.6757V18.7725Z" />
      <path d="M59.9003 23.1596C60.9969 24.1285 62.1849 24.4758 63.7019 24.4758C65.8768 24.4758 68.4721 23.6532 68.4721 20.2897V12.0637H66.1327V13.1971C65.4199 12.3014 64.4695 11.8444 63.4094 11.8444C61.1797 11.8444 59.5165 13.453 59.5165 16.3412C59.5165 19.2843 61.198 20.8381 63.4094 20.8381C64.4878 20.8381 65.4382 20.3262 66.1327 19.4488V20.3445C66.1327 22.0811 64.8167 22.5747 63.7019 22.5747C62.587 22.5747 61.6549 22.2639 60.9421 21.4779L59.9003 23.1596ZM66.1327 17.7671C65.7489 18.3337 64.9081 18.7725 64.1405 18.7725C62.8246 18.7725 61.9108 17.8585 61.9108 16.3412C61.9108 14.824 62.8246 13.91 64.1405 13.91C64.9081 13.91 65.7489 14.3304 66.1327 14.9154V17.7671Z" />
      <path d="M71.9256 10.7659C72.6933 10.7659 73.3147 10.1443 73.3147 9.37658C73.3147 8.60882 72.6933 7.9873 71.9256 7.9873C71.1763 7.9873 70.5366 8.60882 70.5366 9.37658C70.5366 10.1443 71.1763 10.7659 71.9256 10.7659ZM70.7742 20.8929H73.0953V12.0637H70.7742V20.8929Z" />
      <path d="M74.8303 16.4692C74.8303 19.1929 76.7859 21.1123 79.5092 21.1123C81.3185 21.1123 82.4151 20.3262 83 19.5037L81.483 18.0961C81.0627 18.6811 80.423 19.0467 79.6188 19.0467C78.2115 19.0467 77.2246 18.0047 77.2246 16.4692C77.2246 14.9337 78.2115 13.91 79.6188 13.91C80.423 13.91 81.0627 14.2573 81.483 14.8606L83 13.453C82.4151 12.6304 81.3185 11.8444 79.5092 11.8444C76.7859 11.8444 74.8303 13.7638 74.8303 16.4692Z" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.7002 -5.55184e-07C14.0256 1.62362 15.4875 3.13142 17.0683 4.50592C16.0151 7.92275 15.4481 11.5529 15.4481 15.3154C15.4481 19.078 16.0151 22.7082 17.0684 26.125C15.4876 27.4995 14.0257 29.0073 12.7003 30.6309C11.375 29.0075 9.91333 27.4998 8.33271 26.1255C9.38605 22.7085 9.95313 19.0782 9.95313 15.3154C9.95313 11.5527 9.38605 7.92237 8.3327 4.50537C9.9133 3.13103 11.375 1.6234 12.7002 -5.55184e-07ZM5.3107 23.7627C3.63771 22.5899 1.86221 21.5534 0.000311902 20.6694C0.516837 18.976 0.794702 17.1784 0.794702 15.316C0.794702 13.4532 0.516736 11.6553 3.00821e-05 9.9616C1.86203 9.07753 3.63762 8.04101 5.3107 6.86817C5.95048 9.57999 6.28902 12.4082 6.28902 15.3154C6.28902 18.2227 5.95049 21.0509 5.3107 23.7627ZM19.1114 15.3154C19.1114 18.2227 19.4499 21.051 20.0897 23.7628C21.763 22.5898 23.5388 21.5531 25.4011 20.669C24.8847 18.9757 24.6069 17.1783 24.6069 15.3159C24.6069 13.4534 24.8848 11.6557 25.4014 9.96213C23.539 9.07794 21.7631 8.04124 20.0897 6.86817C19.4499 9.57999 19.1114 12.4082 19.1114 15.3154Z"
      />
    </svg>
  );

  const logoWithLabel = (
    <>
      {getLocaleFromParams().toLowerCase() === 'en_us' && (
        <div className={`${styles.text} ${small ? styles.small : ''} ${faded ? styles.fadedText : ''}`}>Secured by</div>
      )}
      <div className={`${styles.svgContainer} ${faded ? styles.fadedIcon : ''} ${small ? styles.small : ''}`}>
        {logoSVG}
      </div>
    </>
  );

  return (
    <div className={styles.SecuredByMagic}>
      {!(noLink || isMobileSDK()) && (
        <Linkable>
          <a
            onClick={trackFooterLinkNavigation}
            onKeyPress={trackFooterLinkNavigation}
            tabIndex={0}
            aria-label="Secured by Magic"
            href="https://magic.link/docs/home/faqs/wallet-end-users"
            target="_blank"
            rel="noopener noreferrer"
          >
            {logoWithLabel}
          </a>
        </Linkable>
      )}

      {(noLink || isMobileSDK()) && logoWithLabel}
    </div>
  );
};

SecuredByMagic.displayName = 'SecuredByMagic';

SecuredByMagic.defaultProps = {
  faded: false,
  small: false,
  noLink: false,
};
