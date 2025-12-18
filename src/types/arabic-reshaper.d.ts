/**
 * Type definitions for js-arabic-reshaper
 * @version 2.9.74
 */

declare module 'js-arabic-reshaper' {
  /**
   * Shapes Arabic letters for proper joining/ligatures.
   * The library exports a `reshape` function (not `ArabicShaper.convertArabic`).
   */
  export function reshape(
    text: string,
    options?: {
      delete_harakat?: boolean;
      ligatures?: boolean;
    }
  ): string;

  // Some builds also expose these constants; keep them loosely typed.
  export const LETTERS: Record<string, unknown>;
  export const LIGATURES: unknown[];
}
