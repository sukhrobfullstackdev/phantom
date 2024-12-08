/* eslint-disable @typescript-eslint/prefer-regexp-exec  */

/**
 * Optimize the given `tag` by removing unnecessary characters.
 */
function trimTag(tag: string) {
  return (
    tag
      // replace double spaces not inside quotes
      .replace(/ {2,}(?=([^"\\]*(\\.|"([^"\\]*\\.)*[^"\\]*"))*[^"]*$)/, ' ')
      // replace extra space in opening tags
      .replace(/ >/, '>')
      // replace extra space in self closing tags
      .replace(/ {2}\/>/, ' />')
  );
}

type Attributes = Record<string, string | number | boolean | undefined>;

/**
 * Map the given attributes (`attrs`) to a valid HTML representation.
 */
function mapAttrs(attrs?: Attributes) {
  if (!attrs) return '';

  return Object.entries(attrs)
    .map(([key, value]) => {
      if (Boolean(value) === value) return key;
      if (value == null) return undefined;
      return `${key}="${value}"`;
    })
    .filter(Boolean)
    .join(' ');
}

const matchCSS = (source: string) => source.match(/\.css$/);
const matchJS = (source: string) => source.match(/\.js$/);

function getPreloadType(source: string) {
  if (matchCSS(source)) return 'style';
  if (matchJS(source)) return 'script';
  return undefined;
}

/**
 * Generate HTML `<link rel="preload">` tags for arbitrary sources in `chunks`.
 */
export function getPreloadLinks(chunks: string[], attr: Attributes = {}) {
  return chunks
    .map(source => {
      const preloadType = getPreloadType(source);
      return (
        preloadType &&
        trimTag(
          `<link ${mapAttrs({
            rel: 'preload',
            href: source,
            as: preloadType,
            ...attr,
          })}>`,
        )
      );
    })
    .filter(Boolean);
}

/**
 * Generate HTML `<link>` tags for compatible CSS sources in `chunks`.
 */
export function getStylesheets(chunks: string[], attr: Attributes = {}) {
  return chunks
    .filter(matchCSS)
    .map(source => trimTag(`<link ${mapAttrs({ rel: 'stylesheet', href: source, ...attr })}>`));
}

/**
 * Generate HTML `<script>` tags for compatible JS sources in `chunks`.
 */
export function getJavascripts(chunks: string[], attr: Attributes = {}) {
  return chunks
    .filter(matchJS)
    .map(source => trimTag(`<script ${mapAttrs({ src: source, defer: true, ...attr })}></script>`));
}
