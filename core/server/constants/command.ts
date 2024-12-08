import { ensureArray } from '~/shared/libs/array-helpers';

export const cmdList = ['start', 'serve', 'build', 'analyze'] as const;

export type ServerCommand = (typeof cmdList)[number];

export type ServerCommandHandlers = { [P in ServerCommand]: () => Promise<void> };

/**
 * Gets the currently active server command.
 */
export function getCommand(): ServerCommand {
  return (process.env.SERVER_COMMAND as ServerCommand) ?? 'start';
}

/**
 * Asserts if the given `value` is a valid server command.
 */
export function isCommand(value: any): value is ServerCommand {
  return cmdList.includes(value);
}

/**
 * Asserts if any of the given `commands` is the currently active server
 * command.
 */
export function assertCommand(commands: ServerCommand | ServerCommand[]) {
  const cmd = getCommand();
  return ensureArray(commands).includes(cmd);
}
