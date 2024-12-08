/* istanbul ignore file */

import { DEPLOY_ENV, ENVType } from '~/shared/constants/env';

function consoleOverride<T extends keyof Console = any>(
  blockedEnvs: ENVType[],
  consoleFunc: (...args: Parameters<Console[T]>) => void,
) {
  return (...args: Parameters<Console[T]>) => {
    if (!blockedEnvs.includes(DEPLOY_ENV)) consoleFunc(...args);
  };
}

/**
 * Overrides specific Console functions to prevent unintentional logging in
 * certain environments.
 *
 * NOTE:
 * Please preserve `console.error` and `console.warn` so that important
 * information can be communicated to the developer.
 */
const console = (windowConsole => ({
  ...windowConsole,
  log: consoleOverride<'log'>([ENVType.Prod], windowConsole.log),
  dir: consoleOverride<'dir'>([ENVType.Prod], windowConsole.dir),
}))(window.console);

(window.console as any) = console;
