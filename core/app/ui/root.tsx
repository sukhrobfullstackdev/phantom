import React, { useEffect } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { useCompare } from 'usable-react';
import { ThemeProvider } from '@magiclabs/ui';
import { flatten } from '~/app/libs/lodash-utils';
import { store } from '~/app/store';
import { Endpoint } from '~/server/routes/endpoint';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { customThemeLogoAssetsSVG } from '~/app/libs/asset-resolvers';
import { loadFeature } from '~/app/libs/load-feature';
import MagicFavicon from '~/app/assets/img/magic-favicon-64x64.png';
import type { FeatureName } from '~/features/manifest';
import { createLazyComponent } from '~/app/ui/components/layout/lazy-component';
import { manifest } from '~/app/constants/feature-manifest';

// Views
import { Send } from '~/app/ui/components/views/send';
import { Confirm } from '~/app/ui/components/views/confirm';
import { Preview } from '~/app/ui/components/views/preview';
import { Error } from '~/app/ui/components/views/error';
import { NoMatch } from '~/app/ui/components/views/no-match';

// Other Components & Context
import { EnforceIframe } from '~/app/ui/components/layout/enforce-iframe';
import { ErrorBoundary } from '~/app/libs/exceptions/error-boundary';

const featurePages = flatten(
  Object.entries(manifest.features).map(([name, config]) => {
    const lazyPages = Object.entries(config.pages).map(([path, file]) => {
      const Page = createLazyComponent({
        loader: async () => {
          const fallback = () => <NoMatch />;
          return (await loadFeature(name as FeatureName, 'Pages', file)).default?.render ?? fallback;
        },

        delay: 0,
      });

      return { Page, path };
    });

    return lazyPages;
  }),
) as Array<{ Page: React.FC; path: string }>;

const Routes: React.FC = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path={Endpoint.Client.SendV1}>
          <EnforceIframe>
            <Send />
          </EnforceIframe>
        </Route>

        <Route exact path={Endpoint.Client.SendLegacy}>
          <EnforceIframe>
            <Send />
          </EnforceIframe>
        </Route>

        <Route exact path={Endpoint.Client.LoginV1}>
          <Confirm />
        </Route>

        <Route exact path={Endpoint.Client.PreviewV1}>
          <EnforceIframe>
            <Preview />
          </EnforceIframe>
        </Route>

        <Route exact path={Endpoint.Client.ErrorV1}>
          <Error />
        </Route>

        {featurePages.map(({ Page, path }) => {
          return (
            <Route exact path={path} key={path}>
              <Page />
            </Route>
          );
        })}

        {/* 404 catch-all */}
        <Route path="*">
          <NoMatch />
        </Route>
      </Switch>
    </BrowserRouter>
  );
};

export const WithTheme: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, isDefaultTheme } = useTheme();
  const href = theme.logoImage;
  const didHrefChange = useCompare(href);

  // Use dynamic favicon logo
  useEffect(() => {
    if (didHrefChange) {
      const fallback = MagicFavicon;
      const iconLink = document.getElementById('favicon') as HTMLLinkElement | null;
      if (iconLink && iconLink instanceof HTMLLinkElement) {
        iconLink.href = isDefaultTheme('logoImage') ? fallback : customThemeLogoAssetsSVG(href).src ?? fallback;
      }
    }
  }, [didHrefChange]);

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export const Root: React.FC = () => {
  return (
    <store.Provider>
      <WithTheme>
        <ErrorBoundary scope="<Routes />">
          <Routes />
        </ErrorBoundary>
      </WithTheme>
    </store.Provider>
  );
};
