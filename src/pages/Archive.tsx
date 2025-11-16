import { useState, useMemo } from "react";
import { Database } from "@/integrations/supabase/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, FolderOpen, FileText, Download, Upload, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadDocumentDialog } from "@/components/archive/UploadDocumentDialog";
import { CreateFolderDialog } from "@/components/archive/CreateFolderDialog";
import { DocumentPreviewDialog } from "@/components/archive/DocumentPreviewDialog";
import { SmartArchiveFeatures } from "@/components/archive/SmartArchiveFeatures";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDocuments } from "@/hooks/useDocuments";
import { useFolders } from "@/hooks/useFolders";
import { useArchiveStats } from "@/hooks/useArchiveStats";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { ScrollableTableWrapper } from "@/components/shared/ScrollableTableWrapper";
import { MobileScrollHint } from "@/components/shared/MobileScrollHint";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";

type Document = Database['public']['Tables']['documents']['Row'];

const Archive = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<(Document & { file_path: string }) | null>(null);

  const { documents, isLoading: documentsLoading, addDocument } = useDocuments();
  const { folders, isLoading: foldersLoading, addFolder } = useFolders();
  const { stats, isLoading: statsLoading } = useArchiveStats();

  const isLoading = documentsLoading || foldersLoading || statsLoading;

  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return documents;
    
    const query = searchQuery.toLowerCase();
    return documents.filter(
      (doc) =>
        doc.name.toLowerCase().includes(query) ||
        doc.category.toLowerCase().includes(query) ||
        doc.description?.toLowerCase().includes(query)
    );
  }, [documents, searchQuery]);

  const handleUploadDocument = async (data: Omit<Database['public']['Tables']['documents']['Insert'], 'id' | 'created_at'>) => {
    await addDocument(data);
    setUploadDialogOpen(false);
  };

  const handleCreateFolder = async (data: Database['public']['Tables']['folders']['Insert']) => {
    await addFolder(data);
    setFolderDialogOpen(false);
  };

  const handlePreviewDocument = (doc: Database['public']['Tables']['documents']['Row']) => {
    // إنشاء file_path من البيانات المتاحة (استخدام id كـ placeholder)
    const documentForPreview = {
      ...doc,
      file_path: `/documents/${doc.id}`, // placeholder path
    };
    setSelectedDocument(documentForPreview);
    setPreviewDialogOpen(true);
  };

  if (isLoading) {
    return <LoadingState message="جاري تحميل الأرشيف..." />;
  }

  return (
    <MobileOptimizedLayout>
      <MobileOptimizedHeader
        title="الأرشيف الإلكتروني"
        description="إدارة وأرشفة المستندات والملفات"
        icon={<FolderOpen className="h-8 w-8 text-primary" />}
        actions={
          <Button onClick={() => setUploadDialogOpen(true)}>
            <Upload className="h-4 w-4 ml-2" />
            رفع مستند
          </Button>
        }
      />

      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المستندات</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalDocuments || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">المجلدات</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalFolders || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">الحجم الإجمالي</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalSize || '0 B'}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">هذا الشهر</CardTitle>
              <Upload className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.thisMonthAdditions || 0}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="documents" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="documents">
              <FileText className="h-4 w-4 ml-2" />
              المستندات
            </TabsTrigger>
            <TabsTrigger value="smart">
              <Search className="h-4 w-4 ml-2" />
              الميزات الذكية
            </TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => setUploadDialogOpen(true)} className="flex-1 sm:flex-none">
                <Upload className="ml-2 h-4 w-4" />
                رفع مستند
              </Button>
              <Button onClick={() => setFolderDialogOpen(true)} variant="outline" className="flex-1 sm:flex-none">
                <Plus className="ml-2 h-4 w-4" />
                إنشاء مجلد
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث في المستندات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>

            {filteredDocuments.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="لا توجد مستندات"
                description="ابدأ برفع المستندات لإدارتها وأرشفتها"
                actionLabel="رفع مستند جديد"
                onAction={() => setUploadDialogOpen(true)}
              />
            ) : (
              <ScrollableTableWrapper>
                <MobileScrollHint />
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-3 text-right text-sm font-medium">اسم المستند</th>
                        <th className="p-3 text-right text-sm font-medium hidden md:table-cell">الفئة</th>
                        <th className="p-3 text-right text-sm font-medium hidden lg:table-cell">الحجم</th>
                        <th className="p-3 text-right text-sm font-medium hidden lg:table-cell">تاريخ الرفع</th>
                        <th className="p-3 text-center text-sm font-medium">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDocuments.map((doc) => (
                        <tr key={doc.id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="truncate">{doc.name}</span>
                            </div>
                          </td>
                          <td className="p-3 hidden md:table-cell">
                            <Badge variant="outline">{doc.category}</Badge>
                          </td>
                          <td className="p-3 hidden lg:table-cell text-muted-foreground text-sm">
                            {doc.file_size || '-'}
                          </td>
                          <td className="p-3 hidden lg:table-cell text-muted-foreground text-sm">
                            {format(new Date(doc.created_at), 'dd/MM/yyyy', { locale: ar })}
                          </td>
                          <td className="p-3">
                            <div className="flex justify-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handlePreviewDocument(doc)}
                              >
                                <Eye className="h-4 w-4" />
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
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ScrollableTableWrapper>
            )}
          </TabsContent>

          <TabsContent value="smart">
            <SmartArchiveFeatures />
          </TabsContent>
        </Tabs>

        <UploadDocumentDialog
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          onUpload={handleUploadDocument}
        />

        <CreateFolderDialog
          open={folderDialogOpen}
          onOpenChange={setFolderDialogOpen}
          onCreate={handleCreateFolder}
        />

      <DocumentPreviewDialog
        open={previewDialogOpen}
        onOpenChange={setPreviewDialogOpen}
        document={selectedDocument}
      />
      </div>
    </MobileOptimizedLayout>
  );
};

export default Archive;
