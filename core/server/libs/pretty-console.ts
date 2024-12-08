import chalk from 'chalk';
import stripAnsi from 'strip-ansi';

let output = '';
let shouldAddSpacer = false;

function hook() {
  const stdout_write = process.stdout.write.bind(process.stdout);
  const stderr_write = process.stderr.write.bind(process.stderr);

  /**
   * Intercepts `stdout` and `stderr` to analyze whether an aesthetic spacer
   * should be logged to the console (as a newline character "\n"). This helps
   * keep console output clean as a whistle during development.
   */
  const withSpacer = (input: string | Uint8Array) => {
    let result = input;

    if (typeof input === 'string') {
      const str = stripAnsi(input);

      if (shouldAddSpacer) {
        shouldAddSpacer = false;
        if (
          // Check for incoming line break in Unix convention
          !str.startsWith('\n') &&
          // Check for incoming line break in DOS convention
          !str.startsWith('\r\n') &&
          // Check for previous line break in Unix convention
          output.lastIndexOf('\n\n') !== output.length - 2 &&
          // Check for previous line break in DOS convention
          output.lastIndexOf('\r\n\r\n') !== output.length - 4
        ) {
          // Append a leading line break to provide
          // visual distinction between log contents.
          result = `\n${input}`;
        }
      }

      output += str;
      // We only need the last 4 characters saved to perform our check.
      output = output.substring(output.length - 4, output.length);
    }

    return result;
  };

  // Hook into `stdout` and capture output.
  (process.stdout.write as any) = (...args: Parameters<typeof stdout_write>) => {
    args[0] = withSpacer(args[0]);
    return stdout_write(...args);
  };

  // Hook into `stderr` and capture output.
  (process.stderr.write as any) = (...args: Parameters<typeof stderr_write>) => {
    args[0] = withSpacer(args[0]);
    return stderr_write(...args);
  };
}

/**
 * Creates a pretty-looking & consistent message label for printing to the console.
 */
function createLabel(type: string) {
  let label = '';

  switch (type) {
    case 'error':
      label = chalk`{red.bold Error}\n{gray.dim ─────}`;
      break;

    case 'warn':
      label = chalk`{yellow.bold Warning}\n{gray.dim ───────}`;
      break;

    case 'info':
      label = chalk`{blue.bold Info}\n{gray.dim ────}`;
      break;

    default:
      label = chalk`${type}\n{gray.dim ${'─'.repeat(stripAnsi(type).length)}}`;
      break;
  }

  return label;
}

/**
 * Creates a wrapped console function with an
 * automatically-formatted label prefix.
 */
function createLogFunction(key: string) {
  return (message?: any, ...optionalParams: any[]) => {
    console[key].apply(console, [createLabel(key)]);
    console[key].apply(console, [message, ...optionalParams]);
  };
}

export const prettyConsole = {
  /**
   * Prints a newline character ("\n") to create a visual distinction between
   * lines of console output. We use this to improve the development experience
   * by making information easier to visually process.
   *
   * With some special sauce under-the-hood, we are able to smartly determine
   * whether a spacer should _actually_ be printed based on previous output
   * compared with incoming output.
   */
  spacer: () => {
    // This flag hints that we should schedule a spacer to be added the next
    // time we detect `stdout` or `stderr` input.
    shouldAddSpacer = true;
  },

  /**
   * Just a simple wrapper for `console.log`, surfaced for convenience.
   */
  log: (...args: Parameters<typeof console.log>) => console.log(...args),

  /**
   * Log a message, formatted & prefixed with a `label`.
   */
  logWithLabel: (label: string, ...args: Parameters<typeof console.log>) => {
    console.log(createLabel(label));
    console.log(...args);
  },

  /**
   * Logs to `stderr` with an "Error" label.
   */
  error: createLogFunction('error'),

  /**
   * Logs to `stderr` with a "Warning" label.
   */
  warn: createLogFunction('warn'),

  /**
   * Logs to `stdout` with an "Info" label.
   */
  info: createLogFunction('info'),
};

// Before `prettyConsole.spacer` will work correctly,
// we have to hook into `stdout` and `stderr`.
hook();
