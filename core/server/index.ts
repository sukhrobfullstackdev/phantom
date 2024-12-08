import './libs/load-env';

import chalk from 'chalk';
import { printWelcomeMessage } from './libs/print-welcome-message';
import { buildStaticBundlesForProduction } from './webpack/production';
import { api } from './api';
import { ServerCommandHandlers, cmdList, isCommand } from './constants/command';
import { getAllServerSideRoutes, printRoutes } from './libs/feature-framework/route-mapping';

const handlers: ServerCommandHandlers = {
  /**
   * Build un-optimized static bundles and start a development server.
   */
  async start() {
    printWelcomeMessage.start();
    await api();
  },

  /**
   * Start a production server. This command does not generate any static
   * bundles.
   */
  async serve() {
    printWelcomeMessage.serve();
    const routes = await getAllServerSideRoutes();
    printRoutes(routes);
    await api();
  },

  /**
   * Build optimized static bundles for production. This command does not start
   * a server.
   */
  async build() {
    printWelcomeMessage.build();
    const routes = await getAllServerSideRoutes();
    printRoutes(routes);
    await buildStaticBundlesForProduction();
  },

  /**
   * Build optimized static bundles for performance analysis. This command
   * serves and opens a lightweight Webpack analyzer app.
   */
  async analyze() {
    printWelcomeMessage.analyze();
    const routes = await getAllServerSideRoutes();
    printRoutes(routes);
    await buildStaticBundlesForProduction();
  },
};

async function main() {
  const cmd = process.argv.slice(2)[0] ?? 'start';

  if (isCommand(cmd)) {
    process.env.SERVER_COMMAND = cmd;
    const handler = handlers[cmd];

    console.clear();

    await handler();
  } else {
    const badCmd = chalk.red.bold(cmd);
    const goodCmd = cmdList.map(c => chalk.green.bold(c)).join(' | ');
    throw new Error(`⚠️ Unknown command \`${badCmd}\`, please provide one of ( ${goodCmd} )`);
  }
}

main().catch(e => {
  console.error(e); // console build output
  process.exit(1);
});
