/**
 * Archive Page - Refactored
 * صفحة الأرشيف - مُعاد هيكلتها
 */
import { useState, useMemo } from "react";
import { Database } from "@/integrations/supabase/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FolderOpen, FileText, Search, Upload, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { useDocuments } from "@/hooks/useDocuments";
import { useFolders } from "@/hooks/useFolders";
import { useArchiveStats } from "@/hooks/archive/useArchiveStats";
import { useDocumentUpload } from "@/hooks/useDocumentUpload";
import { useAuth } from "@/hooks/useAuth";
import { useVisibilitySettings } from "@/hooks/useVisibilitySettings";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArchiveStatsCards,
  ArchiveFoldersTab,
  ArchiveDocumentsTab,
  ArchiveDialogs,
  SmartArchiveFeatures,
} from "@/components/archive";

type Document = Database['public']['Tables']['documents']['Row'];

// ربط أسماء المجلدات بإعدادات الشفافية
const FOLDER_VISIBILITY_MAP: Record<string, string> = {
  'العقود': 'show_archive_contracts',
  'المستندات القانونية': 'show_archive_legal_docs',
  'التقارير المالية': 'show_archive_financial_reports',
  'محاضر الاجتماعات': 'show_archive_meeting_minutes',
};

const Archive = () => {
  const { roles } = useAuth();
  const { settings } = useVisibilitySettings();
  
  // تحديد إذا كان المستخدم وريث أو مستفيد (يحتاج تطبيق إعدادات الشفافية)
  const isHeirOrBeneficiary = roles.includes('waqf_heir') || roles.includes('beneficiary');
  const isStaff = roles.includes('admin') || roles.includes('nazer') || roles.includes('archivist') || roles.includes('accountant');
  
  // فقط admin و nazer و archivist يمكنهم إنشاء/رفع/حذف
  const canManageArchive = roles.includes('admin') || roles.includes('nazer') || roles.includes('archivist');
  
  // التحقق من إمكانية رؤية الأرشيف بالكامل
  const canViewArchive = isStaff || (settings?.show_documents !== false);
  
  // صلاحيات التحميل والمعاينة
  const canDownload = isStaff || (settings?.allow_download_documents !== false);
  const canPreview = isStaff || (settings?.allow_preview_documents !== false);

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
  const { documents, isLoading: documentsLoading, error: documentsError, refetch: refetchDocuments } = useDocuments();
  const { folders: allFolders, isLoading: foldersLoading, error: foldersError, refetch: refetchFolders, addFolder } = useFolders();
  const { stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useArchiveStats();
  const { deleteDocumentWithFile } = useDocumentUpload();

  const isLoading = documentsLoading || foldersLoading || statsLoading;
  const error = documentsError || foldersError || statsError;
  const refetch = () => {
    refetchDocuments();
    refetchFolders();
    refetchStats();
  };

  // فلترة المجلدات حسب إعدادات الشفافية للورثة والمستفيدين
  const folders = useMemo(() => {
    if (!allFolders) return [];
    if (isStaff) return allFolders; // الموظفين يرون كل المجلدات
    
    return allFolders.filter(folder => {
      const settingKey = FOLDER_VISIBILITY_MAP[folder.name];
      if (!settingKey) return true; // مجلدات غير معرّفة تظهر افتراضياً
      return settings?.[settingKey as keyof typeof settings] !== false;
    });
  }, [allFolders, settings, isStaff]);

  // Filtered Documents
  const filteredDocuments = useMemo(() => {
    let filtered = documents;
    
    // فلترة المستندات حسب المجلدات المسموح بها
    if (isHeirOrBeneficiary && !isStaff) {
      const allowedFolderIds = folders.map(f => f.id);
      filtered = filtered.filter(doc => 
        !doc.folder_id || allowedFolderIds.includes(doc.folder_id)
      );
    }
    
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
  }, [documents, searchQuery, selectedFolderId, folders, isHeirOrBeneficiary, isStaff]);

  const selectedFolder = folders?.find(f => f.id === selectedFolderId);

  // Handlers
  const handleCreateFolder = async (data: Database['public']['Tables']['folders']['Insert']) => {
    await addFolder(data);
    setFolderDialogOpen(false);
  };

  const handlePreviewDocument = (doc: Document) => {
    if (!canPreview) return;
    setSelectedDocument({ ...doc, file_path: doc.file_path || `/documents/${doc.id}` });
    setPreviewDialogOpen(true);
  };

  const handleDeleteClick = (doc: Document) => {
    if (!canManageArchive) return;
    setDocumentToDelete(doc);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (documentToDelete && canManageArchive) {
      await deleteDocumentWithFile({
        id: documentToDelete.id,
        storagePath: documentToDelete.file_path,
      });
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };

  const handleDownloadDocument = (doc: Document) => {
    if (!canDownload) return;
    if (doc.file_path) window.open(doc.file_path, '_blank');
  };

  if (isLoading) {
    return <LoadingState message="جاري تحميل الأرشيف..." />;
  }

  if (error) {
    return (
      <ErrorState 
        title="فشل تحميل الأرشيف" 
        message="حدث خطأ أثناء تحميل بيانات الأرشيف"
        onRetry={refetch}
        fullScreen
      />
    );
  }

  // إذا كان المستفيد/الوريث ممنوع من رؤية الأرشيف
  if (!canViewArchive) {
    return (
      <PageErrorBoundary pageName="الأرشيف">
        <MobileOptimizedLayout>
          <MobileOptimizedHeader
            title="الأرشيف الإلكتروني"
            description="إدارة وأرشفة المستندات والملفات"
            icon={<FolderOpen className="h-8 w-8 text-primary" />}
          />
          <Alert className="mt-6">
            <Lock className="h-4 w-4" />
            <AlertDescription>
              الأرشيف غير متاح حالياً. تواصل مع الناظر لمزيد من المعلومات.
            </AlertDescription>
          </Alert>
        </MobileOptimizedLayout>
      </PageErrorBoundary>
    );
  }

  return (
    <PageErrorBoundary pageName="الأرشيف">
      <MobileOptimizedLayout>
        <MobileOptimizedHeader
          title="الأرشيف الإلكتروني"
          description="إدارة وأرشفة المستندات والملفات"
          icon={<FolderOpen className="h-8 w-8 text-primary" />}
          actions={
            canManageArchive ? (
              <Button onClick={() => setUploadDialogOpen(true)}>
                <Upload className="h-4 w-4 ms-2" />
                رفع مستند
              </Button>
            ) : undefined
          }
        />

        <div className="space-y-6">
          <ArchiveStatsCards stats={stats} />

          <Tabs defaultValue="folders" className="space-y-6">
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <TabsList className="inline-flex w-max sm:w-full sm:grid sm:grid-cols-3 min-w-full sm:min-w-0">
                <TabsTrigger value="folders" className="gap-1.5 sm:gap-2 px-3 sm:px-4 whitespace-nowrap">
                  <FolderOpen className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">المجلدات</span>
                </TabsTrigger>
                <TabsTrigger value="documents" className="gap-1.5 sm:gap-2 px-3 sm:px-4 whitespace-nowrap">
                  <FileText className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">المستندات</span>
                </TabsTrigger>
                <TabsTrigger value="smart" className="gap-1.5 sm:gap-2 px-3 sm:px-4 whitespace-nowrap">
                  <Search className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">الميزات الذكية</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="folders">
              <ArchiveFoldersTab
                folders={folders || []}
                filteredDocuments={filteredDocuments}
                selectedFolderId={selectedFolderId}
                selectedFolder={selectedFolder}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSelectFolder={setSelectedFolderId}
                onCreateFolder={canManageArchive ? () => setFolderDialogOpen(true) : undefined}
                onUploadDocument={canManageArchive ? () => setUploadDialogOpen(true) : undefined}
                onPreviewDocument={canPreview ? handlePreviewDocument : undefined}
                onDownloadDocument={canDownload ? handleDownloadDocument : undefined}
                onDeleteDocument={canManageArchive ? handleDeleteClick : undefined}
              />
            </TabsContent>

            <TabsContent value="documents">
              <ArchiveDocumentsTab
                documents={documents}
                filteredDocuments={filteredDocuments}
                isLoading={isLoading}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onUploadDocument={canManageArchive ? () => setUploadDialogOpen(true) : undefined}
                onCreateFolder={canManageArchive ? () => setFolderDialogOpen(true) : undefined}
                onPreviewDocument={canPreview ? handlePreviewDocument : undefined}
                onDeleteDocument={canManageArchive ? handleDeleteClick : undefined}
              />
            </TabsContent>

            <TabsContent value="smart">
              <SmartArchiveFeatures />
            </TabsContent>
          </Tabs>

          {canManageArchive && (
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
          )}
          
          {/* Dialog للمعاينة فقط للمستخدمين بدون صلاحية الإدارة */}
          {!canManageArchive && canPreview && previewDialogOpen && selectedDocument && (
            <ArchiveDialogs
              uploadDialogOpen={false}
              setUploadDialogOpen={() => {}}
              folderDialogOpen={false}
              setFolderDialogOpen={() => {}}
              previewDialogOpen={previewDialogOpen}
              setPreviewDialogOpen={setPreviewDialogOpen}
              deleteDialogOpen={false}
              setDeleteDialogOpen={() => {}}
              selectedDocument={selectedDocument}
              documentToDelete={null}
              onCreateFolder={async () => {}}
              onDeleteConfirm={async () => {}}
            />
          )}
        </div>
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
};

export default Archive;
