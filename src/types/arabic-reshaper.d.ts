/**
 * Type definitions for js-arabic-reshaper
 * @version 2.9.74
 */

declare module 'js-arabic-reshaper' {
  const ArabicShaper: {
    convertArabic(text: string): string;
    convertArabicBack(text: string): string;
  };
  
  export { ArabicShaper };
  export default { ArabicShaper };
}
