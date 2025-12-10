import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TranslationService, type Translation } from '@/services/translation.service';
import { QUERY_KEYS } from '@/lib/query-keys';

export type Language = 'ar' | 'en' | 'fr';

/**
 * Hook لإدارة الترجمات المتعددة اللغات
 */
export function useTranslation() {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('language') as Language) || 'ar';
  });

  // جلب جميع الترجمات
  const { data: translations = [] } = useQuery({
    queryKey: QUERY_KEYS.TRANSLATIONS,
    queryFn: () => TranslationService.fetchAll(),
  });

  // حفظ اللغة عند التغيير
  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  /**
   * الحصول على ترجمة نص
   */
  const t = (key: string, fallback?: string): string => {
    const translation = translations.find(t => t.key === key);
    
    if (!translation) {
      return fallback || key;
    }

    return translation[language] || translation.ar || fallback || key;
  };

  /**
   * الحصول على ترجمة مع متغيرات
   */
  const tWithVars = (key: string, vars: Record<string, string | number>): string => {
    let text = t(key);
    
    Object.entries(vars).forEach(([key, value]) => {
      text = text.replace(`{{${key}}}`, String(value));
    });
    
    return text;
  };

  /**
   * تغيير اللغة
   */
  const changeLanguage = (newLang: Language) => {
    setLanguage(newLang);
  };

  return {
    language,
    t,
    tWithVars,
    changeLanguage,
    translations,
  };
}
