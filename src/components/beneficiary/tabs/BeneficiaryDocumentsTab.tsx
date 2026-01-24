import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, FileText, Trash2, Eye } from "lucide-react";
import { DocumentUploadDialog } from "../DocumentUploadDialog";
import { useBeneficiaryDocuments } from "@/hooks/beneficiary/useBeneficiaryTabsData";
import { format, arLocale as ar } from "@/lib/date";

interface BeneficiaryDocumentsTabProps {
  beneficiaryId: string;
}

interface DocumentMobileCardProps {
  doc: {
    id: string;
    file_name: string;
    file_type: string;
    file_size: number | null;
    file_path: string;
    created_at: string | null;
  };
  onView: (path: string) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

function DocumentMobileCard({ doc, onView, onDelete, isDeleting }: DocumentMobileCardProps) {
  return (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="p-2 bg-primary/10 rounded-lg shrink-0">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{doc.file_name}</h4>
              <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                <span>{doc.file_type}</span>
                {doc.file_size && (
                  <span>• {(doc.file_size / 1024).toFixed(1)} KB</span>
                )}
              </div>
              {doc.created_at && (
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(doc.created_at), "dd/MM/yyyy", { locale: ar })}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onView(doc.file_path)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onDelete(doc.id)}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function BeneficiaryDocumentsTab({ beneficiaryId }: BeneficiaryDocumentsTabProps) {
  const queryClient = useQueryClient();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  
  const { 
    data: documents = [], 
    isLoading, 
    deleteDocument, 
    isDeleting, 
    viewDocument 
  } = useBeneficiaryDocuments(beneficiaryId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base sm:text-lg">مستنداتي ({documents.length})</CardTitle>
            <CardDescription className="text-xs sm:text-sm">جميع المستندات والمرفقات المرفوعة</CardDescription>
          </div>
          <Button onClick={() => setIsUploadOpen(true)} size="sm" className="w-full sm:w-auto">
            <Upload className="h-4 w-4 ms-2" />
            رفع مستند
          </Button>
        </CardHeader>
        <CardContent>
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                جاري التحميل...
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && documents.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground text-sm">لا توجد مستندات مرفوعة بعد</p>
              <Button
                variant="link"
                onClick={() => setIsUploadOpen(true)}
                className="mt-2"
              >
                ارفع مستندك الأول
              </Button>
            </div>
          )}

          {/* Mobile View - Cards */}
          {!isLoading && documents.length > 0 && (
            <div className="md:hidden space-y-3">
              {documents.map((doc) => (
                <DocumentMobileCard
                  key={doc.id}
                  doc={doc}
                  onView={viewDocument}
                  onDelete={deleteDocument}
                  isDeleting={isDeleting}
                />
              ))}
            </div>
          )}

          {/* Desktop View - Table */}
          {!isLoading && documents.length > 0 && (
            <div className="hidden md:block rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">اسم الملف</TableHead>
                    <TableHead className="text-right">النوع</TableHead>
                    <TableHead className="text-right hidden lg:table-cell">الحجم</TableHead>
                    <TableHead className="text-right">تاريخ الرفع</TableHead>
                    <TableHead className="text-right">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate max-w-[200px]">{doc.file_name}</span>
                      </TableCell>
                      <TableCell>{doc.file_type}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {doc.file_size ? `${(doc.file_size / 1024).toFixed(2)} KB` : "—"}
                      </TableCell>
                      <TableCell>
                        {doc.created_at && format(new Date(doc.created_at), "dd/MM/yyyy", { locale: ar })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewDocument(doc.file_path)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteDocument(doc.id)}
                            disabled={isDeleting}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <DocumentUploadDialog
        beneficiaryId={beneficiaryId}
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        onUploadComplete={() => {
          queryClient.invalidateQueries({ queryKey: ["beneficiary-documents"] });
        }}
      />
    </div>
  );
}
