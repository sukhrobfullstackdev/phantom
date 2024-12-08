import chalk from 'chalk';
import boxen from 'boxen';
import { DEPLOY_ENV, BACKEND_URL, E2E_URL, GET_CREDENTIALS_PROXY_URL } from '~/shared/constants/env';
import { ServerCommand } from '../constants/command';
import { prettyConsole } from './pretty-console';

const authRelayer = chalk.bold('Auth Relayer');
const backendUrl = chalk.cyan.bold(BACKEND_URL);
const e2eUrl = chalk.cyan.bold(E2E_URL);
const appEnv = chalk.green.bold(DEPLOY_ENV);
const magic = chalk.blueBright.bold('magic');
const analysis = chalk.bold('dependency analysis');
const separator = chalk.gray.dim('❯');

function withBoxen(message: string | string[]) {
  const formattedMessage = Array.isArray(message) ? message.join('\n') : message;
  return boxen(formattedMessage, {
    padding: { top: 1, right: 3, bottom: 1, left: 3 },
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    borderStyle: 'double' as any,
    borderColor: 'magenta',
  });
}

export const printWelcomeMessage: Record<ServerCommand, () => void> = {
  start: () => {
    const message: string[] = [];

    message.push(`${authRelayer} development server`);
    message.push('');
    message.push(`                 Mode ${separator} ${magic}`);
    message.push(`          Environment ${separator} ${appEnv}`);
    message.push(`              Backend ${separator} ${backendUrl}`);
    message.push(`           End-to-end ${separator} ${e2eUrl}`);
    message.push(`Credentials Proxy Url ${separator} ${GET_CREDENTIALS_PROXY_URL}`);

    prettyConsole.spacer();
    console.log(withBoxen(message));
    prettyConsole.spacer();
  },

  analyze: () => {
    prettyConsole.spacer();
    console.log(withBoxen(`Building ${authRelayer} static bundle(s)\nfor ${analysis}.`));
    prettyConsole.spacer();
  },

  build: () => {
    const message: string[] = [];

    message.push(`Building ${authRelayer} static bundle(s)...`);
    message.push(``);
    message.push(`         Mode ${separator} ${magic}`);
    message.push(`  Environment ${separator} ${appEnv}`);
    message.push(`      Backend ${separator} ${backendUrl}`);

    prettyConsole.spacer();
    console.log(withBoxen(message));
    prettyConsole.spacer();
  },

  serve: () => {
    const message: string[] = [];

    message.push(`${authRelayer} production server...`);
    message.push('');
    message.push(`         Mode ${separator} ${magic}`);
    message.push(`  Environment ${separator} ${appEnv}`);
    message.push(`      Backend ${separator} ${backendUrl}`);

    prettyConsole.spacer();
    console.log(withBoxen(message));
    prettyConsole.spacer();
  },
};
