import { useState } from 'react';
import { useSavedSearches, SavedSearch } from '@/hooks/ui/useSavedSearches';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { 
  Search, 
  Star, 
  Trash2, 
  Plus, 
  Clock,
  Filter 
} from 'lucide-react';
import { SearchCriteria } from './AdvancedSearchDialog';
import { toast } from 'sonner';

interface SavedSearchesManagerProps {
  onLoadSearch?: (criteria: SearchCriteria) => void;
}

/**
 * مدير البحث المحفوظ المتقدم - المرحلة 2
 * إدارة وتنظيم عمليات البحث المحفوظة
 */
export function SavedSearchesManager({ onLoadSearch }: SavedSearchesManagerProps) {
  const { searches, isLoading, saveSearch, deleteSearch, updateUsage, error, refetch } = useSavedSearches();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchToDelete, setSearchToDelete] = useState<SavedSearch | null>(null);
  const [newSearch, setNewSearch] = useState({
    name: '',
    description: '',
    search_criteria: {} as SearchCriteria,
    is_favorite: false,
  });

  const handleSaveSearch = async () => {
    if (!newSearch.name.trim()) {
      toast.error('يرجى إدخال اسم البحث');
      return;
    }

    try {
      await saveSearch(newSearch);
      setDialogOpen(false);
      setNewSearch({
        name: '',
        description: '',
        search_criteria: {},
        is_favorite: false,
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleLoadSearch = (search: SavedSearch) => {
    updateUsage(search.id);
    if (onLoadSearch) {
      onLoadSearch(search.search_criteria as SearchCriteria);
      toast.success(`تم تحميل البحث: ${search.name}`);
    }
  };

  const handleDeleteClick = (search: SavedSearch) => {
    setSearchToDelete(search);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (searchToDelete) {
      try {
        await deleteSearch(searchToDelete.id);
        setDeleteDialogOpen(false);
        setSearchToDelete(null);
      } catch (error) {
        // Error handled by mutation
      }
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState title="خطأ في تحميل عمليات البحث" message={(error as Error).message} onRetry={refetch} />;
  }

  const favoriteSearches = searches.filter(s => s.is_favorite);
  const recentSearches = searches.filter(s => !s.is_favorite).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* رأس القسم */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Filter className="h-5 w-5" />
            عمليات البحث المحفوظة
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            احفظ عمليات البحث المتكررة للوصول السريع
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              حفظ بحث جديد
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>حفظ عملية بحث</DialogTitle>
              <DialogDescription>
                احفظ معايير البحث الحالية للاستخدام لاحقاً
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">اسم البحث *</Label>
                <Input
                  id="name"
                  value={newSearch.name}
                  onChange={(e) => setNewSearch({ ...newSearch, name: e.target.value })}
                  placeholder="مثال: مستفيدون نشطون من القبيلة..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">الوصف (اختياري)</Label>
                <Textarea
                  id="description"
                  value={newSearch.description}
                  onChange={(e) => setNewSearch({ ...newSearch, description: e.target.value })}
                  placeholder="وصف مختصر لمعايير البحث..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleSaveSearch}>
                حفظ
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {searches.length === 0 ? (
        <EmptyState
          icon={Search}
          title="لا توجد عمليات بحث محفوظة"
          description="لم تقم بحفظ أي عملية بحث بعد. احفظ عمليات البحث المتكررة للوصول السريع."
        />
      ) : (
        <div className="space-y-6">
          {/* المفضلة */}
          {favoriteSearches.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                المفضلة ({favoriteSearches.length})
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {favoriteSearches.map((search) => (
                  <SearchCard
                    key={search.id}
                    search={search}
                    onLoad={handleLoadSearch}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
            </div>
          )}

          {/* الأخيرة */}
          {recentSearches.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Clock className="h-4 w-4" />
                الأخيرة ({recentSearches.length})
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {recentSearches.map((search) => (
                  <SearchCard
                    key={search.id}
                    search={search}
                    onLoad={handleLoadSearch}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
            </div>
          )}

          {/* جميع العمليات */}
          {searches.length > favoriteSearches.length + 5 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Search className="h-4 w-4" />
                جميع العمليات ({searches.length - favoriteSearches.length - recentSearches.length})
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {searches.slice(favoriteSearches.length + 5).map((search) => (
                  <SearchCard
                    key={search.id}
                    search={search}
                    onLoad={handleLoadSearch}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* حوار التأكيد */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف عملية البحث</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف عملية البحث "{searchToDelete?.name}"؟
              لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface SearchCardProps {
  search: SavedSearch;
  onLoad: (search: SavedSearch) => void;
  onDelete: (search: SavedSearch) => void;
}

function SearchCard({ search, onLoad, onDelete }: SearchCardProps) {
  const criteriaCount = Object.keys(search.search_criteria).length;
  
  return (
    <Card className="hover:bg-accent/50 transition-colors cursor-pointer group">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0" onClick={() => onLoad(search)}>
              <div className="flex items-center gap-2">
                <h4 className="font-medium truncate">{search.name}</h4>
                {search.is_favorite && (
                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                )}
              </div>
              {search.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {search.description}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(search);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {criteriaCount} معيار
              </Badge>
              <span>استخدم {search.usage_count} مرة</span>
            </div>
            {search.last_used_at && (
              <span>
                {new Date(search.last_used_at).toLocaleDateString('ar-SA', {
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
