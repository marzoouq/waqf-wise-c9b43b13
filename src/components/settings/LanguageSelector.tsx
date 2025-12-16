import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation, Language } from '@/hooks/ui/useTranslation';
import { Languages } from 'lucide-react';

export const LanguageSelector = () => {
  const { language, changeLanguage } = useTranslation();

  const languages = [
    { value: 'ar' as Language, label: 'العربية', flag: '🇸🇦' },
    { value: 'en' as Language, label: 'English', flag: '🇬🇧' },
    { value: 'fr' as Language, label: 'Français', flag: '🇫🇷' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Languages className="h-5 w-5" />
          اللغة
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select value={language} onValueChange={(value) => changeLanguage(value as Language)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  <span className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="text-sm text-muted-foreground">
            <p>اللغة الحالية: {languages.find(l => l.value === language)?.label}</p>
            <p className="mt-2">
              سيتم تطبيق اللغة المختارة على جميع عناصر الواجهة.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
