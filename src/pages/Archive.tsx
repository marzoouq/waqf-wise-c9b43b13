/**
 * Archive Page - Refactored
 * صفحة الأرشيف - مُعاد هيكلتها
 */
import { useState, useMemo } from "react";
import { Database } from "@/integrations/supabase/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FolderOpen, FileText, Search, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { LoadingState } from "@/components/shared/LoadingState";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { useDocuments } from "@/hooks/useDocuments";
import { useFolders } from "@/hooks/useFolders";
import { useArchiveStats } from "@/hooks/useArchiveStats";
import { useDocumentUpload } from "@/hooks/useDocumentUpload";
import {
  ArchiveStatsCards,
  ArchiveFoldersTab,
  ArchiveDocumentsTab,
  ArchiveDialogs,
  SmartArchiveFeatures,
} from "@/components/archive";

type Document = Database['public']['Tables']['documents']['Row'];

const Archive = () => {
  // Dialog States
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Selection States
  const [selectedDocument, setSelectedDocument] = useState<(Document & { file_path: string }) | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Data Hooks
  const { documents, isLoading: documentsLoading } = useDocuments();
  const { folders, isLoading: foldersLoading, addFolder } = useFolders();
  const { stats, isLoading: statsLoading } = useArchiveStats();
  const { deleteDocumentWithFile } = useDocumentUpload();

  const isLoading = documentsLoading || foldersLoading || statsLoading;

  // Filtered Documents
  const filteredDocuments = useMemo(() => {
    let filtered = documents;
    if (selectedFolderId) {
      filtered = filtered.filter(doc => doc.folder_id === selectedFolderId);
    }
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

  const selectedFolder = folders?.find(f => f.id === selectedFolderId);

  // Handlers
  const handleCreateFolder = async (data: Database['public']['Tables']['folders']['Insert']) => {
    await addFolder(data);
    setFolderDialogOpen(false);
  };

  const handlePreviewDocument = (doc: Document) => {
    setSelectedDocument({ ...doc, file_path: doc.file_path || `/documents/${doc.id}` });
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

  const handleDownloadDocument = (doc: Document) => {
    if (doc.file_path) window.open(doc.file_path, '_blank');
  };

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

            <TabsContent value="folders">
              <ArchiveFoldersTab
                folders={folders || []}
                filteredDocuments={filteredDocuments}
                selectedFolderId={selectedFolderId}
                selectedFolder={selectedFolder}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSelectFolder={setSelectedFolderId}
                onCreateFolder={() => setFolderDialogOpen(true)}
                onUploadDocument={() => setUploadDialogOpen(true)}
                onPreviewDocument={handlePreviewDocument}
                onDownloadDocument={handleDownloadDocument}
                onDeleteDocument={handleDeleteClick}
              />
            </TabsContent>

            <TabsContent value="documents">
              <ArchiveDocumentsTab
                documents={documents}
                filteredDocuments={filteredDocuments}
                isLoading={isLoading}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onUploadDocument={() => setUploadDialogOpen(true)}
                onCreateFolder={() => setFolderDialogOpen(true)}
                onPreviewDocument={handlePreviewDocument}
                onDeleteDocument={handleDeleteClick}
              />
            </TabsContent>

            <TabsContent value="smart">
              <SmartArchiveFeatures />
            </TabsContent>
          </Tabs>

          <ArchiveDialogs
            uploadDialogOpen={uploadDialogOpen}
            setUploadDialogOpen={setUploadDialogOpen}
            folderDialogOpen={folderDialogOpen}
            setFolderDialogOpen={setFolderDialogOpen}
            previewDialogOpen={previewDialogOpen}
            setPreviewDialogOpen={setPreviewDialogOpen}
            deleteDialogOpen={deleteDialogOpen}
            setDeleteDialogOpen={setDeleteDialogOpen}
            selectedDocument={selectedDocument}
            documentToDelete={documentToDelete}
            onCreateFolder={handleCreateFolder}
            onDeleteConfirm={handleDeleteConfirm}
          />
        </div>
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
};

export default Archive;
