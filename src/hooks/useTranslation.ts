import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type Language = 'ar' | 'en' | 'fr';

interface Translation {
  key: string;
  ar: string;
  en: string | null;
  fr: string | null;
}

/**
 * Hook لإدارة الترجمات المتعددة اللغات
 */
export function useTranslation() {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('language') as Language) || 'ar';
  });

  // جلب جميع الترجمات
  const { data: translations = [] } = useQuery({
    queryKey: ['translations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('translations')
        .select('key, ar, en, fr');
      
      if (error) throw error;
      return data as Translation[];
    },
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
