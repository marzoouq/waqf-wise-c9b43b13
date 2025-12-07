import { useState, useEffect } from "react";

/**
 * Media Query Hook - Flexible media query detection
 * More flexible than useIsMobile - works with any media query
 * @param query - CSS media query string
 * @returns boolean indicating if query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Set initial value
    setMatches(media.matches);

    // Create listener
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    
    // Add listener
    media.addEventListener("change", listener);

    // Cleanup
    return () => media.removeEventListener("change", listener);
  }, [query]); // ✅ فقط query - بدون matches لمنع الحلقة اللانهائية

  return matches;
}
