import { useState, useEffect, useRef } from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * Hook محسّن لاكتشاف الجوال
 * ✅ يستخدم قيمة أولية من matchMedia
 * ✅ لا يُعيد setIsMobile في useEffect لمنع re-render غير ضروري
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    // ❌ إزالة setIsMobile(mql.matches) - القيمة الأولية صحيحة من useState
    
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  return isMobile;
}

/**
 * Hook للتحقق من حجم الشاشة
 * ✅ لا يُعيد setMatches في useEffect لمنع re-render غير ضروري
 */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handleChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    
    // ❌ إزالة setMatches(mql.matches) - القيمة الأولية صحيحة من useState
    
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
}
