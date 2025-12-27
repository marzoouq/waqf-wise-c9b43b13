/**
 * Type definitions for bidi-js
 * Unicode Bidirectional Algorithm implementation
 */

declare module 'bidi-js' {
  export interface EmbeddingLevels {
    levels: Uint8Array;
    paragraphs: Array<{
      start: number;
      end: number;
      level: number;
    }>;
  }

  export interface BidiInstance {
    /**
     * Calculate bidi embedding levels for a string
     */
    getEmbeddingLevels(
      text: string,
      explicitDirection?: 'ltr' | 'rtl'
    ): EmbeddingLevels;

    /**
     * Get reorder segments (flip ranges) for visual reordering
     */
    getReorderSegments(
      text: string,
      embeddingLevels: EmbeddingLevels,
      start?: number,
      end?: number
    ): Array<[number, number]>;

    /**
     * Get map of characters that need to be mirrored
     */
    getMirroredCharactersMap(
      text: string,
      embeddingLevels: EmbeddingLevels,
      start?: number,
      end?: number
    ): Map<number, string>;

    /**
     * Get mirrored character for a single character
     */
    getMirroredCharacter(char: string): string | null;

    /**
     * Get bidi character type name
     */
    getBidiCharTypeName(char: string): string;
  }

  /**
   * Factory function to create bidi instance
   */
  export default function bidiFactory(): BidiInstance;
}
