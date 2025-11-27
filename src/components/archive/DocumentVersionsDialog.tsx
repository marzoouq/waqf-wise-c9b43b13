import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDocumentVersions } from '@/hooks/useDocumentVersions';
import { History, RotateCcw, FileText, Check } from 'lucide-react';
import { LoadingState } from '@/components/shared/LoadingState';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface DocumentVersionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string | undefined;
  documentName?: string;
}

export function DocumentVersionsDialog({
  open,
  onOpenChange,
  documentId,
  documentName,
}: DocumentVersionsDialogProps) {
  const { versions, isLoading, restoreVersion, isRestoring } = useDocumentVersions(documentId);

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'غير معروف';
    if (bytes < 1024) return `${bytes} بايت`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} كيلوبايت`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} ميجابايت`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            سجل الإصدارات
          </DialogTitle>
          <DialogDescription>
            {documentName ? `إصدارات المستند: ${documentName}` : 'عرض جميع إصدارات المستند'}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <LoadingState message="جاري تحميل الإصدارات..." />
        ) : versions && versions.length > 0 ? (
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-3">
              {versions.map((version) => (
                <Card key={version.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            الإصدار {version.version_number}
                          </span>
                          {version.is_current && (
                            <Badge variant="default" className="gap-1">
                              <Check className="h-3 w-3" />
                              الحالي
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {version.change_description || 'بدون وصف'}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>
                            {format(new Date(version.created_at), 'PPpp', { locale: ar })}
                          </span>
                          <span>{formatFileSize(version.file_size)}</span>
                          {version.created_by && (
                            <span>بواسطة: {version.created_by}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {!version.is_current && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => restoreVersion(version.id)}
                        disabled={isRestoring}
                      >
                        <RotateCcw className="h-4 w-4 ml-2" />
                        استعادة
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>لا توجد إصدارات سابقة لهذا المستند</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
