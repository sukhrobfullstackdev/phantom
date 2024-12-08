import YAML from 'yaml';
import { readFileSync } from 'fs';

/**
 * Parse a YAML file at the given `path` and return its contents as a plain
 * object.
 */
export function parseYAML<T = any>(path: string): T {
  const file = readFileSync(path, 'utf8');
  return YAML.parse(file);
}
