import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import fs from 'fs';
import { resolveToRoot } from './path-utils';

const env = process.argv.slice(2)[1];

// We only load env during local development.
// A value of "skip" flags that this build is happening in our deployment pipeline.
if (env && env !== 'skip') {
  const localEnvFile = `${env}.env`;
  process.env.LOCAL_ENV_FILE = localEnvFile;
  processEnv(resolveToRoot('config', 'env', localEnvFile));
}

function processEnv(path: string) {
  const origEnv = { ...process.env };
  const parsed: dotenv.DotenvParseOutput = {};

  try {
    let result: dotenv.DotenvConfigOutput = {};
    const envFileContents = fs.readFileSync(path, 'utf8');
    result.parsed = dotenv.parse(envFileContents);

    result = dotenvExpand(result);

    for (const key of Object.keys(result.parsed || {})) {
      if (typeof parsed[key] === 'undefined' && typeof origEnv[key] === 'undefined') {
        parsed[key] = result.parsed?.[key]!;
      }
    }
  } catch (e) {
    process.exit(1);
  }

  return Object.assign(process.env, parsed);
}
