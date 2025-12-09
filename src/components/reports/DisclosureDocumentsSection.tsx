/**
 * قسم عرض مستندات الإفصاح السنوي
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FileText, 
  Download, 
  Eye,
  Zap,
  Wrench,
  Receipt,
  Calculator,
  Wallet,
  FileCheck
} from "lucide-react";
import { useDisclosureDocuments, DisclosureDocument } from "@/hooks/reports/useDisclosureDocuments";

interface DisclosureDocumentsSectionProps {
  disclosureId?: string;
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  'فاتورة_خدمات': Zap,
  'صيانة': Wrench,
  'زكاة_ضرائب': Receipt,
  'تقرير_مالي': FileText,
  'خدمات_محاسبية': Calculator,
  'مصاريف_عامة': Wallet,
  'اقفال_سنوي': FileCheck,
};

const TYPE_COLORS: Record<string, string> = {
  'فاتورة_خدمات': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'صيانة': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  'زكاة_ضرائب': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'تقرير_مالي': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  'خدمات_محاسبية': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  'مصاريف_عامة': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
  'اقفال_سنوي': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
};

function DocumentCard({ document, typeLabel }: { document: DisclosureDocument; typeLabel: string }) {
  const Icon = TYPE_ICONS[document.document_type] || FileText;
  const colorClass = TYPE_COLORS[document.document_type] || TYPE_COLORS['مصاريف_عامة'];

  const handleView = () => {
    window.open(document.file_path, '_blank');
  };

  const handleDownload = () => {
    const link = window.document.createElement('a');
    link.href = document.file_path;
    link.download = document.document_name + '.pdf';
    link.click();
  };

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorClass}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="font-medium text-sm">{document.document_name}</p>
          {document.description && (
            <p className="text-xs text-muted-foreground">{document.description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs">
          {typeLabel}
        </Badge>
        <Button variant="ghost" size="icon" onClick={handleView} title="معاينة">
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleDownload} title="تحميل">
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function DisclosureDocumentsSection({ disclosureId }: DisclosureDocumentsSectionProps) {
  const { documents, groupedDocuments, isLoading, getTypeLabel } = useDisclosureDocuments(disclosureId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            المستندات الداعمة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
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
          <p className="text-muted-foreground text-center py-4">
            لا توجد مستندات مرفقة بهذا الإفصاح
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          المستندات الداعمة
          <Badge variant="secondary">{documents.length} مستند</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedDocuments).map(([type, docs]) => (
          <div key={type} className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
              {(() => {
                const Icon = TYPE_ICONS[type] || FileText;
                return <Icon className="h-4 w-4" />;
              })()}
              {getTypeLabel(type)}
              <Badge variant="outline" className="text-xs">{docs.length}</Badge>
            </h4>
            <div className="space-y-2">
              {docs.map((doc) => (
                <DocumentCard 
                  key={doc.id} 
                  document={doc} 
                  typeLabel={getTypeLabel(doc.document_type)} 
                />
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
