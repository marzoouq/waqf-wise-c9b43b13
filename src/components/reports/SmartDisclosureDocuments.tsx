/**
 * عرض ذكي لمستندات الإفصاح السنوي
 * يجمع بين الملخص والتفاصيل التفاعلية
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FileText, 
  LayoutGrid, 
  List,
  Download,
  ExternalLink
} from "lucide-react";
import { useSmartDisclosureDocuments } from "@/hooks/reports/useSmartDisclosureDocuments";
import { DocumentContentViewer, ExtractedContent } from "./DocumentContentViewer";
import { DocumentCategorySummary } from "./DocumentCategorySummary";
import { ErrorState } from "@/components/shared/ErrorState";

interface SmartDisclosureDocumentsProps {
  disclosureId?: string;
}

export function SmartDisclosureDocuments({ disclosureId }: SmartDisclosureDocumentsProps) {
  const { documents, categorySummary, isLoading, error, refetch, getTypeLabel } = useSmartDisclosureDocuments(disclosureId);
  const [viewMode, setViewMode] = useState<'summary' | 'details'>('summary');

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            المستندات الداعمة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return <ErrorState title="خطأ في التحميل" message="فشل تحميل المستندات" onRetry={refetch} />;
  }

  if (!documents.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            المستندات الداعمة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            لا توجد مستندات مرفقة بهذا الإفصاح
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleViewOriginal = (filePath: string) => {
    window.open(filePath, '_blank');
  };

  const handleDownload = (filePath: string, documentName: string) => {
    const link = window.document.createElement('a');
    link.href = filePath;
    link.download = documentName + '.pdf';
    link.click();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            المستندات الداعمة
            <Badge variant="secondary">{documents.length} مستند</Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'summary' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('summary')}
            >
              <LayoutGrid className="h-4 w-4 ms-1" />
              ملخص
            </Button>
            <Button
              variant={viewMode === 'details' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('details')}
            >
              <List className="h-4 w-4 ms-1" />
              تفاصيل
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {viewMode === 'summary' && categorySummary.length > 0 && (
          <DocumentCategorySummary categories={categorySummary} />
        )}

        {viewMode === 'details' && (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4 flex-wrap h-auto gap-1">
              <TabsTrigger value="all">الكل</TabsTrigger>
              {categorySummary.map((cat) => (
                <TabsTrigger key={cat.type} value={cat.type}>
                  {cat.label} ({cat.count})
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {documents.map((doc) => (
                <DocumentContentViewer
                  key={doc.id}
                  content={(doc.extracted_content as unknown as ExtractedContent) || {
                    type: doc.document_type,
                    title: doc.document_name,
                    items: [],
                    summary: doc.content_summary || undefined,
                    total: doc.total_amount || undefined
                  }}
                  documentName={doc.document_name}
                  onViewOriginal={() => handleViewOriginal(doc.file_path)}
                  onDownload={() => handleDownload(doc.file_path, doc.document_name)}
                />
              ))}
            </TabsContent>

            {categorySummary.map((cat) => (
              <TabsContent key={cat.type} value={cat.type} className="space-y-4">
                {documents
                  .filter((doc) => doc.document_type === cat.type)
                  .map((doc) => (
                    <DocumentContentViewer
                      key={doc.id}
                      content={(doc.extracted_content as unknown as ExtractedContent) || {
                        type: doc.document_type,
                        title: doc.document_name,
                        items: [],
                        summary: doc.content_summary || undefined,
                        total: doc.total_amount || undefined
                      }}
                      documentName={doc.document_name}
                      onViewOriginal={() => handleViewOriginal(doc.file_path)}
                      onDownload={() => handleDownload(doc.file_path, doc.document_name)}
                    />
                  ))}
              </TabsContent>
            ))}
          </Tabs>
        )}

        {/* عرض ملخص سريع في وضع التفاصيل */}
        {viewMode === 'details' && categorySummary.length > 0 && (
          <div className="pt-4 border-t">
            <DocumentCategorySummary categories={categorySummary} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
