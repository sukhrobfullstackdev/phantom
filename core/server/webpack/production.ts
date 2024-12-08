import fse from 'fs-extra';
import path from 'path';
import type { Stats } from 'webpack';
import { recursiveReadDir, resolveToRoot } from '../libs/path-utils';
import { createCompiler } from './create-compiler';

export async function buildStaticBundlesForProduction() {
  const compiler = await createCompiler();

  const formattedStats = await new Promise<string | undefined>((resolve, reject) => {
    compiler.run((err, stats) => {
      const toStringOptions: Stats.ToStringOptions = {
        colors: true,
        hash: false,
        timings: true,
        chunks: false,
        chunkModules: false,
        modules: false,
      };

      if (stats?.hasErrors()) {
        reject(new Error(stats?.toString(toStringOptions)));
      } else {
        resolve(stats?.toString(toStringOptions));
      }
    });
  });

  await copyCDNStatics();

  if (formattedStats) console.log(formattedStats);
}

async function copyCDNStatics() {
  const cdnStaticRoot = resolveToRoot('cdn-static');
  const buildRoot = resolveToRoot('build');
  const cdnStatics = await recursiveReadDir(cdnStaticRoot);
  const ignored = ['./cdn-static/README.md'];

  await Promise.all(
    cdnStatics
      .filter(filePath => !ignored.includes(filePath))
      .map(async filePath => {
        const relativeTo = resolveToRoot(filePath).replace(cdnStaticRoot, '.');
        await fse.copy(filePath, path.join(buildRoot, relativeTo));
      }),
  );
}
