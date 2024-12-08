import { matchesUA } from 'browserslist-useragent';

export type UserAgentTarget = 'modern' | 'legacy';

/**
 * Detects a modern (ES6-compatible) or legacy (ES5) browser.
 *
 * We use this to serve the correct compatibility
 * bundle for older browsers such as IE11.
 */
export function getUserAgentTarget(userAgent?: string): UserAgentTarget {
  // Assume a modern browser if `user-agent` header is missing.
  if (!userAgent) return 'modern';

  const isModern = matchesUA(userAgent, {
    allowHigherVersions: true,
    /* eslint-disable-next-line prettier/prettier */
    browsers: ['Chrome >= 61', 'Safari >= 10.1', 'iOS >= 11.3', 'Firefox >= 60', 'Edge >= 16'],
  });

  return isModern ? 'modern' : 'legacy';
}
