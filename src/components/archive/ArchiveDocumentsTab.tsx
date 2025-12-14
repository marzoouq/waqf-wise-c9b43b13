/**
 * Archive Documents Tab Component
 * تبويب المستندات في الأرشيف
 */
import { Database } from "@/integrations/supabase/types";
import { Plus, Upload, FileText, Search, Eye, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ExportButton } from "@/components/shared/ExportButton";
import { UnifiedDataTable, Column } from "@/components/unified/UnifiedDataTable";
import { format, arLocale as ar } from "@/lib/date";

type Document = Database['public']['Tables']['documents']['Row'];

interface ArchiveDocumentsTabProps {
  documents: Document[];
  filteredDocuments: Document[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onUploadDocument: () => void;
  onCreateFolder: () => void;
  onPreviewDocument: (doc: Document) => void;
  onDeleteDocument: (doc: Document) => void;
}

export function ArchiveDocumentsTab({
  documents,
  filteredDocuments,
  isLoading,
  searchQuery,
  onSearchChange,
  onUploadDocument,
  onCreateFolder,
  onPreviewDocument,
  onDeleteDocument,
}: ArchiveDocumentsTabProps) {
  const columns: Column<Document>[] = [
    {
      key: 'name',
      label: 'اسم المستند',
      render: (_value, doc) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="truncate">{doc.name}</span>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'الفئة',
      hideOnMobile: true,
      render: (_value, doc) => <Badge variant="outline">{doc.category}</Badge>,
    },
    {
      key: 'file_size',
      label: 'الحجم',
      hideOnMobile: true,
      hideOnTablet: true,
      render: (_value, doc) => doc.file_size || '-',
    },
    {
      key: 'created_at',
      label: 'تاريخ الرفع',
      hideOnMobile: true,
      hideOnTablet: true,
      render: (_value, doc) => format(new Date(doc.created_at), 'dd/MM/yyyy', { locale: ar }),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={onUploadDocument} className="flex-1 sm:flex-none">
          <Upload className="ms-2 h-4 w-4" />
          رفع مستند
        </Button>
        <Button onClick={onCreateFolder} variant="outline" className="flex-1 sm:flex-none">
          <Plus className="ms-2 h-4 w-4" />
          إنشاء مجلد
        </Button>
        {documents.length > 0 && (
          <ExportButton
            data={documents.map(doc => ({
              'اسم المستند': doc.name,
              'الفئة': doc.category,
              'النوع': doc.file_type,
              'الحجم': doc.file_size || '-',
              'تاريخ الرفع': format(new Date(doc.uploaded_at), 'yyyy/MM/dd', { locale: ar }),
              'الوصف': doc.description || '-',
            }))}
            filename="المستندات"
            title="قائمة المستندات"
            headers={['اسم المستند', 'الفئة', 'النوع', 'الحجم', 'تاريخ الرفع', 'الوصف']}
            variant="outline"
            size="sm"
          />
        )}
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="البحث في المستندات..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pr-10"
        />
      </div>

      <UnifiedDataTable
        columns={columns}
        data={filteredDocuments}
        loading={isLoading}
        emptyMessage="لا توجد مستندات. ابدأ برفع المستندات لإدارتها وأرشفتها"
        actions={(doc) => (
          <div className="flex justify-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onPreviewDocument(doc);
              }}
              title="عرض"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteDocument(doc);
              }}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              title="حذف"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled
              title="وظيفة التنزيل قيد التطوير"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        )}
      />
    </div>
  );
}
