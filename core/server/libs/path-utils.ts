import path from 'path';
import { promises } from 'fs';

/**
 * Resolves a file path (or a list of path segments) to the root of this
 * repository.
 */
export function resolveToRoot(...pathSegments: string[]) {
  return path.resolve(__dirname, '..', '..', '..', ...pathSegments);
}

/**
 * Remove the file extension from the path given by `str`.
 */
export function removeFileExt(str: string) {
  const { dir, name } = path.parse(str);
  return `${dir}/${name}`;
}

/**
 * Get a listing of files from a directory (`dir`), recursively.
 */
export async function recursiveReadDir(dir: string, arr: string[] = []): Promise<string[]> {
  try {
    const result = await promises.readdir(dir);

    await Promise.all(
      result.map(async (part: string) => {
        const absolutePath = path.join(dir, part);

        const pathStat = await promises.stat(absolutePath);

        if (pathStat.isDirectory()) {
          await recursiveReadDir(absolutePath, arr);
          return;
        }

        arr.push(`./${path.relative(resolveToRoot(), absolutePath)}`);
      }),
    );

    return arr.sort();
  } catch {
    return [];
  }
}

/**
 * Replaces back-slashes with forward-slashes in the given `str`.
 */
export function normalizeSlashes(str: string) {
  return str.replace(/\\/g, '/');
}

/**
 * Removes leading slashes from the given `str`.
 */
export function removeLeadingSlashes(str: string) {
  return str.replace(/^[/\\]+/, '');
}

/**
 * Removes trailing slashes from the given `str`.
 */
export function removeTrailingSlashes(str: string) {
  return str.replace(/[/\\]+$/, '');
}
