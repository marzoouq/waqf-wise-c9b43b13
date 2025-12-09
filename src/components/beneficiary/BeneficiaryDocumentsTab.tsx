import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, FileText, Trash2, Eye } from "lucide-react";
import { DocumentUploadDialog } from "./DocumentUploadDialog";
import { useBeneficiaryDocuments } from "@/hooks/beneficiary/useBeneficiaryTabsData";
import { format, arLocale as ar } from "@/lib/date";

interface BeneficiaryDocumentsTabProps {
  beneficiaryId: string;
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
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>مستنداتي ({documents.length})</CardTitle>
            <CardDescription>جميع المستندات والمرفقات المرفوعة</CardDescription>
          </div>
          <Button onClick={() => setIsUploadOpen(true)}>
            <Upload className="h-4 w-4 ml-2" />
            رفع مستند
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">اسم الملف</TableHead>
                  <TableHead className="text-right">النوع</TableHead>
                  <TableHead className="text-right">الحجم</TableHead>
                  <TableHead className="text-right">تاريخ الرفع</TableHead>
                  <TableHead className="text-right">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">جاري التحميل...</TableCell>
                  </TableRow>
                ) : documents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      لا توجد مستندات مرفوعة بعد
                    </TableCell>
                  </TableRow>
                ) : (
                  documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {doc.file_name}
                      </TableCell>
                      <TableCell>{doc.file_type}</TableCell>
                      <TableCell>
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
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
