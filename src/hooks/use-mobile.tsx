import { useState, useEffect, useCallback, useMemo } from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * Hook محسّن لاكتشاف الجوال
 * - يستخدم قيمة أولية من matchMedia لتجنب الوميض
 * - يستخدم useCallback لتحسين الأداء
 */
export function useIsMobile() {
  // تحديد القيمة الأولية مباشرة لتجنب الوميض
  const getInitialValue = useCallback(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < MOBILE_BREAKPOINT;
  }, []);

  const [isMobile, setIsMobile] = useState(getInitialValue);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    // تعيين القيمة الأولية
    setIsMobile(mql.matches);
    
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  return isMobile;
}

/**
 * Hook للتحقق من حجم الشاشة
 */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handleChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    
    setMatches(mql.matches);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
}
