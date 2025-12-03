import { useState, useMemo } from "react";
import { Database } from "@/integrations/supabase/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, FolderOpen, FileText, Download, Upload, Eye, Trash2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { UploadDocumentDialog } from "@/components/archive/UploadDocumentDialog";
import { CreateFolderDialog } from "@/components/archive/CreateFolderDialog";
import { DocumentPreviewDialog } from "@/components/archive/DocumentPreviewDialog";
import { SmartArchiveFeatures } from "@/components/archive/SmartArchiveFeatures";
import { ArchiveStatsCards } from "@/components/archive/ArchiveStatsCards";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDocuments } from "@/hooks/useDocuments";
import { useFolders } from "@/hooks/useFolders";
import { useArchiveStats } from "@/hooks/useArchiveStats";
import { useDocumentUpload } from "@/hooks/useDocumentUpload";
import { LoadingState } from "@/components/shared/LoadingState";
import { format, arLocale as ar } from "@/lib/date";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { ExportButton } from "@/components/shared/ExportButton";
import { UnifiedDataTable, Column } from "@/components/unified/UnifiedDataTable";

type Document = Database['public']['Tables']['documents']['Row'];

const Archive = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<(Document & { file_path: string }) | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  const { documents, isLoading: documentsLoading } = useDocuments();
  const { folders, isLoading: foldersLoading, addFolder } = useFolders();
  const { stats, isLoading: statsLoading } = useArchiveStats();
  const { deleteDocumentWithFile } = useDocumentUpload();

  const isLoading = documentsLoading || foldersLoading || statsLoading;

  const filteredDocuments = useMemo(() => {
    let filtered = documents;
    
    // Filter by folder
    if (selectedFolderId) {
      filtered = filtered.filter(doc => doc.folder_id === selectedFolderId);
    }
    
    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.name.toLowerCase().includes(query) ||
          doc.category.toLowerCase().includes(query) ||
          doc.description?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [documents, searchQuery, selectedFolderId]);

  const handleCreateFolder = async (data: Database['public']['Tables']['folders']['Insert']) => {
    await addFolder(data);
    setFolderDialogOpen(false);
  };

  const handlePreviewDocument = (doc: Document) => {
    const documentForPreview = {
      ...doc,
      file_path: doc.file_path || `/documents/${doc.id}`,
    };
    setSelectedDocument(documentForPreview);
    setPreviewDialogOpen(true);
  };

  const handleDeleteClick = (doc: Document) => {
    setDocumentToDelete(doc);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (documentToDelete) {
      await deleteDocumentWithFile({
        id: documentToDelete.id,
        storagePath: documentToDelete.file_path,
      });
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };

  const handleDownloadDocument = async (doc: Document) => {
    const filePath = doc.file_path;
    if (filePath) {
      window.open(filePath, '_blank');
    }
  };

  const selectedFolder = folders?.find(f => f.id === selectedFolderId);

  if (isLoading) {
    return <LoadingState message="جاري تحميل الأرشيف..." />;
  }

  return (
    <PageErrorBoundary pageName="الأرشيف">
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
        <ArchiveStatsCards stats={stats} />

        <Tabs defaultValue="folders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="folders">
              <FolderOpen className="h-4 w-4 ml-2" />
              المجلدات
            </TabsTrigger>
            <TabsTrigger value="documents">
              <FileText className="h-4 w-4 ml-2" />
              المستندات
            </TabsTrigger>
            <TabsTrigger value="smart">
              <Search className="h-4 w-4 ml-2" />
              الميزات الذكية
            </TabsTrigger>
          </TabsList>

          {/* Folders Tab */}
          <TabsContent value="folders" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => setFolderDialogOpen(true)} className="flex-1 sm:flex-none">
                <Plus className="ml-2 h-4 w-4" />
                إنشاء مجلد جديد
              </Button>
              <Button onClick={() => setUploadDialogOpen(true)} variant="outline" className="flex-1 sm:flex-none">
                <Upload className="ml-2 h-4 w-4" />
                رفع مستند
              </Button>
            </div>

            {/* Breadcrumb Navigation */}
            {selectedFolderId && (
              <div className="flex items-center gap-2 text-sm">
                <Button
                  variant="link"
                  className="p-0 h-auto text-primary"
                  onClick={() => setSelectedFolderId(null)}
                >
                  الأرشيف
                </Button>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{selectedFolder?.name}</span>
              </div>
            )}

            {/* Folders Grid */}
            {!selectedFolderId && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {folders && folders.length > 0 ? (
                  folders.map((folder) => (
                    <Card
                      key={folder.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setSelectedFolderId(folder.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <FolderOpen className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{folder.name}</h3>
                            <p className="text-xs text-muted-foreground">
                              {folder.files_count || 0} ملفات
                            </p>
                          </div>
                        </div>
                        {folder.description && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                            {folder.description}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">لا توجد مجلدات. أنشئ مجلداً جديداً لتنظيم مستنداتك</p>
                  </div>
                )}
              </div>
            )}

            {/* Documents in Selected Folder */}
            {selectedFolderId && (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="البحث في المستندات..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                </div>

                {filteredDocuments.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredDocuments.map((doc) => (
                      <Card key={doc.id} className="hover:bg-muted/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <FileText className="h-8 w-8 text-primary flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{doc.name}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">{doc.file_type}</Badge>
                                <span className="text-xs text-muted-foreground">{doc.file_size}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1 mt-3">
                            <Button size="sm" variant="ghost" onClick={() => handlePreviewDocument(doc)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDownloadDocument(doc)}>
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive"
                              onClick={() => handleDeleteClick(doc)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">لا توجد مستندات في هذا المجلد</p>
                    <Button onClick={() => setUploadDialogOpen(true)} variant="outline" className="mt-4">
                      <Upload className="ml-2 h-4 w-4" />
                      رفع مستند
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

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
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>

            <UnifiedDataTable
              columns={[
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
              ] as Column<Document>[]}
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
                      handlePreviewDocument(doc);
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
                      handleDeleteClick(doc);
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
          </TabsContent>

          <TabsContent value="smart">
            <SmartArchiveFeatures />
          </TabsContent>
        </Tabs>

        <UploadDocumentDialog
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
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

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="حذف المستند"
        description="هل أنت متأكد من حذف هذا المستند؟ لن يمكن استرجاعه بعد الحذف."
        itemName={documentToDelete?.name || ""}
      />
      </div>
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
};

export default Archive;
