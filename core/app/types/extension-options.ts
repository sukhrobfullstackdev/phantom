/**
 * Describes the shape of known global options encoded
 * into the URL query for first-party Magic SDK extensions.
 */
export interface ExtensionOptions {
  /**
   * Custom theme parameters integrated specifically for UserVoice, a partner
   * that has unique requirements due to their multi-tenanted SaaS use-case.
   *
   * @see https://github.com/magiclabs/uservoice-theme-provider-extension
   */
  uservoiceThemeProvider: { appName: string | null; logoURL: string | null };

  [key: string]: any;
}
