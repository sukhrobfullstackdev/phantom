export function cssTimeToMilliseconds(timeString?: string | null) {
  if (!timeString) return 0;

  const num = parseFloat(timeString);
  /* eslint-disable-next-line @typescript-eslint/prefer-regexp-exec */
  const [unit] = timeString.match(/m?s/) ?? [];

  switch (unit) {
    case 's':
      return num * 1000;

    case 'ms':
      return num;

    default:
      return 0;
  }
}
