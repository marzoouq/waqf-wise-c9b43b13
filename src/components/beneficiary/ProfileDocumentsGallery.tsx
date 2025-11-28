import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/shared/LoadingState';
import { 
  FileText, 
  Download, 
  Eye, 
  CheckCircle, 
  Clock,
  Image as ImageIcon,
  File
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface ProfileDocumentsGalleryProps {
  beneficiaryId: string;
}

export function ProfileDocumentsGallery({ beneficiaryId }: ProfileDocumentsGalleryProps) {
  const { data: documents, isLoading } = useQuery({
    queryKey: ['beneficiary-documents', beneficiaryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('beneficiary_attachments')
        .select('id, file_name, file_type, file_size, description, is_verified, created_at')
        .eq('beneficiary_id', beneficiaryId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 60 * 1000,
  });

  if (isLoading) {
    return <LoadingState message="جاري تحميل المستندات..." />;
  }

  const verifiedCount = documents?.filter(d => d.is_verified).length || 0;
  const pendingCount = documents?.filter(d => !d.is_verified).length || 0;

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image') || fileType === 'صورة') {
      return <ImageIcon className="h-5 w-5" />;
    }
    return <File className="h-5 w-5" />;
  };

  const getFileTypeColor = (fileType: string) => {
    switch (fileType) {
      case 'هوية':
        return 'bg-info-light text-info border-info/20';
      case 'شهادة ميلاد':
        return 'bg-success-light text-success border-success/20';
      case 'عقد زواج':
        return 'bg-secondary text-secondary-foreground border-secondary/20';
      case 'مستند بنكي':
        return 'bg-warning-light text-warning border-warning/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 بايت';
    const k = 1024;
    const sizes = ['بايت', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* إحصائيات المستندات */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المستندات</p>
                <p className="text-2xl font-bold text-foreground">
                  {documents?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-success-light flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">موثقة</p>
                <p className="text-2xl font-bold text-foreground">{verifiedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-warning-light flex items-center justify-center">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">قيد المراجعة</p>
                <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* معرض المستندات */}
      <Card>
        <CardHeader>
          <CardTitle>المستندات المرفقة</CardTitle>
        </CardHeader>
        <CardContent>
          {!documents || documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">لا توجد مستندات مرفقة</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex flex-col gap-3 p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors border border-border"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      {getFileIcon(doc.file_type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground truncate mb-1">
                        {doc.file_name}
                      </h4>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge className={`text-xs ${getFileTypeColor(doc.file_type)}`}>
                          {doc.file_type}
                        </Badge>
                        {doc.is_verified ? (
                          <Badge variant="default" className="text-xs gap-1">
                            <CheckCircle className="h-3 w-3" />
                            موثق
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs gap-1">
                            <Clock className="h-3 w-3" />
                            قيد المراجعة
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(doc.created_at), 'PPP', { locale: ar })}
                        {doc.file_size && ` • ${formatFileSize(doc.file_size)}`}
                      </p>
                      {doc.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {doc.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-border">
                    <Button size="sm" variant="outline" className="flex-1 gap-2">
                      <Eye className="h-3 w-3" />
                      عرض
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 gap-2">
                      <Download className="h-3 w-3" />
                      تحميل
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
