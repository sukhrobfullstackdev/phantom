import { uniq } from '~/app/libs/lodash-utils';
import path from 'path';
import { match } from 'path-to-regexp';
import type { BuildTimeFeatureManifestData } from '~/features/framework';
import { decodeBase64URL } from '~/server/libs/base64';
import { getUserAgentTarget } from '~/server/libs/useragent';
import { readBuildManifest } from '~/server/webpack/webpack-utils';
import { handler } from '../handler-factory';
import { getJavascripts, getPreloadLinks, getStylesheets } from './tags';

/**
 * From the `pathname`, try to match a feature in `featureManifest`
 * and generate tags for the initial chunks that feature requires.
 */
function getInitialAssets(pathname: string, featureManifest: BuildTimeFeatureManifestData, nonce: string) {
  const featureConfig = Object.values(featureManifest.features).find(config => {
    return !!Object.keys(config.pages).find(route => {
      const matcher = match(route, { decode: decodeBase64URL });
      return !!matcher(pathname);
    });
  });

  const { chunks: featureChunks = [] } = featureConfig ?? {};
  const { preloadAsyncChunks, mainChunks } = featureManifest;

  const preloads = getPreloadLinks([...preloadAsyncChunks, ...mainChunks, ...featureChunks], { nonce });
  const javascripts = getJavascripts([...mainChunks, ...featureChunks]);
  const stylesheets = getStylesheets([...mainChunks, ...featureChunks]);

  const head = uniq(['<!--[-->', ...preloads, ...stylesheets, '<!--]-->']).join('');
  const body = uniq(['<!--[-->', ...javascripts, '<!--]-->']).join('');

  return { head, body };
}

/**
 * Serve a static Single Page Application (SPA).
 */
export function renderSPA(status = 200) {
  return handler(async (req, res) => {
    const target = getUserAgentTarget(req.headers['user-agent']);
    const templatePath = path.resolve(__dirname, './template.ejs');
    const manifest = await readBuildManifest(target);

    return res.status(status).render(templatePath, {
      nonce: res.ext.nonce,
      manifest: manifest.json,
      initial_assets: getInitialAssets(req.path, manifest.parsed, res.ext.nonce),
    });
  });
}
