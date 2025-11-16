import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useSmartSearch, useDocumentTags } from '@/hooks/useDocumentTags';
import { Search, Tag, FileText, Sparkles } from 'lucide-react';
import { LoadingState } from '@/components/shared/LoadingState';

interface SmartSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SmartSearchDialog({ open, onOpenChange }: SmartSearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'text' | 'tags' | 'ocr'>('text');
  const smartSearch = useSmartSearch();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    await smartSearch.mutateAsync({
      query: searchQuery,
      searchType
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            البحث الذكي في الأرشيف
          </DialogTitle>
        </DialogHeader>

        <Tabs value={searchType} onValueChange={(v) => setSearchType(v as 'text' | 'tags' | 'ocr')} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="text" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              بحث نصي
            </TabsTrigger>
            <TabsTrigger value="tags" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              بحث بالوسوم
            </TabsTrigger>
            <TabsTrigger value="ocr" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              بحث في المحتوى
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 flex gap-2">
            <Input
              placeholder={
                searchType === 'text' ? 'ابحث في أسماء المستندات...' :
                searchType === 'tags' ? 'ابحث بالوسوم...' :
                'ابحث في محتوى المستندات...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={smartSearch.isPending}>
              <Search className="h-4 w-4 ml-2" />
              بحث
            </Button>
          </div>

          <TabsContent value={searchType} className="mt-4 space-y-4">
            {smartSearch.isPending && <LoadingState message="جاري البحث..." />}
            
            {smartSearch.data && smartSearch.data.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                لم يتم العثور على نتائج
              </div>
            )}

            {smartSearch.data && smartSearch.data.length > 0 && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {smartSearch.data.map((result: any) => (
                  <Card key={result.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">
                          {result.documents?.name || result.name || 'مستند'}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {result.extracted_text?.substring(0, 200) || 
                           result.documents?.description || 
                           result.description}
                        </p>
                        {result.tag_name && (
                          <div className="mt-2">
                            <Badge variant="secondary">{result.tag_name}</Badge>
                          </div>
                        )}
                        {result.confidence_score && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            دقة: {(result.confidence_score * 100).toFixed(0)}%
                          </div>
                        )}
                      </div>
                      <Button variant="outline" size="sm">
                        عرض
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}