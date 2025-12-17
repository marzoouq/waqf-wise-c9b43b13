import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, X, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface KnowledgeBaseSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  popularSearches?: string[];
}

export function KnowledgeBaseSearch({ 
  value, 
  onChange, 
  placeholder = "ابحث في قاعدة المعرفة...",
  popularSearches = []
}: KnowledgeBaseSearchProps) {
  const [focused, setFocused] = useState(false);

  const defaultPopularSearches = [
    'كيف أبدأ',
    'تسجيل الدخول',
    'إعادة تعيين كلمة المرور',
    'التوزيعات',
    'التقارير المالية',
  ];

  const searches = popularSearches.length > 0 ? popularSearches : defaultPopularSearches;

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pe-10 ps-10"
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
        />
        {value && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            onClick={() => onChange('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {focused && !value && searches.length > 0 && (
        <Card className="absolute top-full mt-2 w-full z-50 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>عمليات البحث الشائعة</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {searches.map((search) => (
                <Badge
                  key={search}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => onChange(search)}
                >
                  {search}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
