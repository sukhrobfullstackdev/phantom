export default function trim(str: string | undefined | null, c = '\\s'): string {
  return str?.replace(new RegExp(`^([${c}]*)(.*?)([${c}]*)$`), '$2') ?? '';
}
