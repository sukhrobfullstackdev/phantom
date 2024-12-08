import { Compiler } from 'webpack';
import path from 'path';
import chalk from 'chalk';
import { prettyConsole } from '~/server/libs/pretty-console';
import { printWelcomeMessage } from '~/server/libs/print-welcome-message';
import { getCommand } from '~/server/constants/command';

export class ReportChangedFilesPlugin {
  static hookOptions = { name: 'ReportChangedFilesPlugin' };

  constructor() {}

  apply(compiler: Compiler) {
    compiler.hooks.watchRun.tap(ReportChangedFilesPlugin.hookOptions, compilation => {
      const changedTimes = (compilation as any)?.watchFileSystem?.watcher?.mtimes ?? {};
      const changedFiles = Object.keys(changedTimes)
        .map(file => `  ${chalk.gray('-')} ./${path.relative(process.cwd(), file)}`)
        .join('\n');

      if (changedFiles.length) {
        // Clean slate
        console.clear();
        printWelcomeMessage[getCommand()]();

        prettyConsole.spacer();
        prettyConsole.logWithLabel(chalk`{bold Rebuilding...}`, `The following files changed:\n${changedFiles}`);
        prettyConsole.spacer();
      }
    });
  }
}
