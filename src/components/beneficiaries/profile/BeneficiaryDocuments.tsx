import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { FileText, Download, Eye, Calendar, CheckCircle } from 'lucide-react';

interface Document {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number | null;
  description: string | null;
  is_verified: boolean | null;
  uploaded_by_name: string | null;
  created_at: string;
}

interface BeneficiaryDocumentsProps {
  beneficiaryId: string;
}

/**
 * مستندات المستفيد - المرحلة 2
 */
export function BeneficiaryDocuments({ beneficiaryId }: BeneficiaryDocumentsProps) {
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['beneficiary-documents', beneficiaryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('beneficiary_attachments')
        .select('*')
        .eq('beneficiary_id', beneficiaryId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Document[];
    },
  });

  if (isLoading) {
    return <LoadingState />;
  }

  if (documents.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="لا توجد مستندات"
        description="لم يتم رفع أي مستندات لهذا المستفيد بعد"
      />
    );
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileTypeColor = (type: string) => {
    if (type.includes('pdf')) return 'destructive';
    if (type.includes('image')) return 'default';
    if (type.includes('word') || type.includes('document')) return 'secondary';
    return 'outline';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          المستندات والمرفقات
        </CardTitle>
        <CardDescription>
          جميع المستندات المرفوعة للمستفيد ({documents.length} مستند)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium truncate">{doc.file_name}</p>
                    {doc.is_verified && (
                      <Badge variant="default" className="gap-1 text-xs">
                        <CheckCircle className="h-3 w-3" />
                        موثّق
                      </Badge>
                    )}
                  </div>
                  
                  {doc.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {doc.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <Badge variant={getFileTypeColor(doc.file_type)} className="text-xs">
                      {doc.file_type}
                    </Badge>
                    <span>{formatFileSize(doc.file_size)}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(doc.created_at).toLocaleDateString('ar-SA')}
                    </span>
                    {doc.uploaded_by_name && (
                      <span>بواسطة: {doc.uploaded_by_name}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
