import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Save, Loader2, X } from 'lucide-react';

interface SearchFilters {
  searchText: string;
  category: string;
  status: string;
  verification: string;
  tribe: string;
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
}

/**
 * مكون البحث المتقدم للمستفيدين
 * يدعم البحث النصي والفلترة حسب معايير متعددة
 */
export function AdvancedSearch({ onSearch }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    searchText: '',
    category: '',
    status: '',
    verification: '',
    tribe: '',
  });

  const [savedSearchName, setSavedSearchName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // جلب عمليات البحث المحفوظة
  const { data: savedSearches = [] } = useQuery({
    queryKey: ['saved-searches'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', user.id)
        .order('usage_count', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleClearFilters = () => {
    const emptyFilters: SearchFilters = {
      searchText: '',
      category: '',
      status: '',
      verification: '',
      tribe: '',
    };
    setFilters(emptyFilters);
    onSearch(emptyFilters);
  };

  interface SavedSearchRecord {
    id: string;
    name: string;
    search_criteria: unknown;
    usage_count: number;
  }

  const handleSaveSearch = async () => {
    if (!savedSearchName.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('saved_searches')
      .insert([{
        user_id: user.id,
        name: savedSearchName,
        search_criteria: JSON.parse(JSON.stringify(filters)),
      }]);

    if (!error) {
      setSavedSearchName('');
      setShowSaveDialog(false);
    }
  };

  const handleLoadSearch = (search: SavedSearchRecord) => {
    const criteria = search.search_criteria as SearchFilters;
    setFilters(criteria);
    onSearch(criteria);

    // تحديث عدد الاستخدام
    supabase
      .from('saved_searches')
      .update({
        usage_count: search.usage_count + 1,
        last_used_at: new Date().toISOString(),
      })
      .eq('id', search.id)
      .then();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          البحث المتقدم
        </CardTitle>
        <CardDescription>
          ابحث عن المستفيدين باستخدام معايير متعددة
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* البحث النصي */}
        <div className="space-y-2">
          <Label htmlFor="searchText">بحث نصي</Label>
          <Input
            id="searchText"
            placeholder="الاسم، رقم الهوية، الهاتف..."
            value={filters.searchText}
            onChange={(e) => setFilters({ ...filters, searchText: e.target.value })}
          />
        </div>

        {/* الفلاتر */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">الفئة</Label>
            <Select value={filters.category} onValueChange={(v) => setFilters({ ...filters, category: v })}>
              <SelectTrigger id="category">
                <SelectValue placeholder="جميع الفئات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">جميع الفئات</SelectItem>
                <SelectItem value="أسر منتجة">أسر منتجة</SelectItem>
                <SelectItem value="أيتام">أيتام</SelectItem>
                <SelectItem value="أرامل">أرامل</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">الحالة</Label>
            <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
              <SelectTrigger id="status">
                <SelectValue placeholder="جميع الحالات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
                <SelectItem value="suspended">معلق</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="verification">حالة التحقق</Label>
            <Select value={filters.verification} onValueChange={(v) => setFilters({ ...filters, verification: v })}>
              <SelectTrigger id="verification">
                <SelectValue placeholder="جميع الحالات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">جميع الحالات</SelectItem>
                <SelectItem value="pending">قيد المراجعة</SelectItem>
                <SelectItem value="verified">تم التحقق</SelectItem>
                <SelectItem value="rejected">مرفوض</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tribe">القبيلة</Label>
            <Input
              id="tribe"
              placeholder="اسم القبيلة"
              value={filters.tribe}
              onChange={(e) => setFilters({ ...filters, tribe: e.target.value })}
            />
          </div>
        </div>

        {/* الأزرار */}
        <div className="flex gap-2">
          <Button onClick={handleSearch} className="flex-1">
            <Search className="h-4 w-4 ml-2" />
            بحث
          </Button>
          <Button variant="outline" onClick={handleClearFilters}>
            <X className="h-4 w-4 ml-2" />
            مسح
          </Button>
          <Button variant="outline" onClick={() => setShowSaveDialog(!showSaveDialog)}>
            <Save className="h-4 w-4 ml-2" />
            حفظ
          </Button>
        </div>

        {/* حفظ البحث */}
        {showSaveDialog && (
          <div className="flex gap-2">
            <Input
              placeholder="اسم البحث"
              value={savedSearchName}
              onChange={(e) => setSavedSearchName(e.target.value)}
            />
            <Button onClick={handleSaveSearch}>حفظ</Button>
          </div>
        )}

        {/* عمليات البحث المحفوظة */}
        {savedSearches.length > 0 && (
          <div className="space-y-2">
            <Label>عمليات البحث المحفوظة</Label>
            <div className="flex flex-wrap gap-2">
              {savedSearches.map((search) => (
                <Badge
                  key={search.id}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => handleLoadSearch(search)}
                >
                  {search.name}
                  {search.usage_count > 0 && (
                    <span className="mr-1 text-xs">({search.usage_count})</span>
                  )}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}