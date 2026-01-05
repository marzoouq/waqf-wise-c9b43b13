/**
 * مكون عرض المرفقات
 * Request Attachments Component
 */
import { memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RequestService } from '@/services/request.service';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Paperclip, 
  Download, 
  FileText, 
  Image as ImageIcon, 
  FileSpreadsheet,
  File,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface RequestAttachmentsProps {
  requestId: string;
}

interface Attachment {
  id: string;
  request_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number | null;
  description: string | null;
  uploaded_at: string;
  uploaded_by: string | null;
}

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
  if (fileType.includes('pdf')) return <FileText className="h-4 w-4" />;
  if (fileType.includes('sheet') || fileType.includes('excel')) return <FileSpreadsheet className="h-4 w-4" />;
  return <File className="h-4 w-4" />;
};

const formatFileSize = (bytes: number | null) => {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const RequestAttachments = memo(({ requestId }: RequestAttachmentsProps) => {
  const { data: attachments = [], isLoading } = useQuery<Attachment[]>({
    queryKey: ['request-attachments', requestId],
    queryFn: () => RequestService.getAttachments(requestId),
    enabled: !!requestId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Paperclip className="h-4 w-4" />
            <h4 className="font-semibold text-sm">المرفقات</h4>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (attachments.length === 0) {
    return (
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Paperclip className="h-4 w-4" />
            <h4 className="font-semibold text-sm">المرفقات</h4>
          </div>
          <p className="text-sm text-muted-foreground text-center py-4">
            لا توجد مرفقات لهذا الطلب
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Paperclip className="h-4 w-4" />
            <h4 className="font-semibold text-sm">المرفقات</h4>
          </div>
          <Badge variant="secondary">{attachments.length}</Badge>
        </div>
        
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="p-2 bg-background rounded-md">
                  {getFileIcon(attachment.file_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {attachment.file_name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatFileSize(attachment.file_size)}</span>
                    <span>•</span>
                    <span>
                      {format(new Date(attachment.uploaded_at), 'dd MMM yyyy', { locale: ar })}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => window.open(attachment.file_path, '_blank')}
                  title="معاينة"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  asChild
                >
                  <a href={attachment.file_path} download={attachment.file_name} title="تحميل">
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

RequestAttachments.displayName = 'RequestAttachments';
