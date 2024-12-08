import { Server } from 'http';
import chalk from 'chalk';
import { createHttpTerminator } from 'http-terminator';
import { ValuesOf } from '~/shared/types/utility-types';
import { prettyConsole } from './pretty-console';
import { proxyServer } from './proxy-server';

export const ShutdownSignal = [
  'SIGHUP',
  'SIGINT',
  'SIGQUIT',
  'SIGILL',
  'SIGTRAP',
  'SIGABRT',
  'SIGBUS',
  'SIGFPE',
  'SIGSEGV',
  'SIGUSR1',
  'SIGUSR2',
  'SIGTERM',
] as const;
export type ShutdownSignal = ValuesOf<typeof ShutdownSignal>;

type ShutdownTask = { title: string; task: (signal: ShutdownSignal) => void | Promise<void> };
const shutdownTasks: ShutdownTask[] = [];

/**
 * Attach the given `listener` to `process`
 * events for known shutdown signals.
 */
export function addShutdownListener(title: string, task: ShutdownTask['task']) {
  shutdownTasks.push({ title, task });
}

/**
 * Gracefully terminate the given
 * `server` and Node.js processes.
 */
export function useGracefulShutdown(server: Server) {
  const httpTerminator = createHttpTerminator({ server, gracefulTerminationTimeout: 8000 });

  addShutdownListener('Shutting down server', async () => {
    if (server.listening) {
      await httpTerminator.terminate();
    }
  });

  addShutdownListener('Shutting down proxy server', () => {
    proxyServer.close();
  });
}

let isShuttingDown = false;

// Create process listeners for
// each registered shutdown signal.
ShutdownSignal.forEach(signal => {
  const onShutdown = async () => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    if (process.stdout.isTTY) console.clear();

    const signalLabel = chalk.bold.red(`\`${signal}\``);
    prettyConsole.spacer();
    console.log(`Received ${signalLabel} signal, starting graceful shutdown.\n`);
    prettyConsole.spacer();

    const shutdownPromises = shutdownTasks.map(({ title, task }) =>
      Promise.resolve(task(signal)).then(() => {
        console.log(`  ${chalk.green('✔')} ${title}`);
      }),
    );

    await Promise.all(shutdownPromises);

    prettyConsole.spacer();
    prettyConsole.log('Graceful shutdown completed. Exiting process.\n');
    process.exit();
  };

  process.on(signal, onShutdown as any);
});
