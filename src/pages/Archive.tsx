import { useState, useMemo } from "react";
import { Plus, Search, FolderOpen, FileText, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadDocumentDialog } from "@/components/archive/UploadDocumentDialog";
import { CreateFolderDialog } from "@/components/archive/CreateFolderDialog";
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

const Archive = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);

  const { documents, isLoading: documentsLoading, addDocument } = useDocuments();
  const { folders, isLoading: foldersLoading, addFolder } = useFolders();
  const { stats, isLoading: statsLoading } = useArchiveStats();

  const isLoading = documentsLoading || foldersLoading || statsLoading;

  // Filter documents based on search query
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

  const handleUploadDocument = async (data: any) => {
    await addDocument(data);
    setUploadDialogOpen(false);
  };

  const handleCreateFolder = async (data: any) => {
    await addFolder(data);
    setFolderDialogOpen(false);
  };

  if (isLoading) {
    return <LoadingState message="جاري تحميل الأرشيف..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 md:p-8 lg:p-10 space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gradient-primary">
              الأرشيف الإلكتروني
            </h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              إدارة وأرشفة المستندات والملفات
            </p>
          </div>
          <Button 
            className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-soft w-full md:w-auto"
            onClick={() => setUploadDialogOpen(true)}
          >
            <Upload className="ml-2 h-4 w-4 md:h-5 md:w-5" />
            <span className="text-sm md:text-base">رفع مستند</span>
          </Button>
        </div>

        {/* Search */}
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="البحث في الأرشيف (اسم الملف، المستفيد، نوع المستند...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                إجمالي المستندات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.totalDocuments}</div>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                المجلدات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">{stats.totalFolders}</div>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                الحجم الكلي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">{stats.totalSize}</div>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                مضاف هذا الشهر
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{stats.thisMonthAdditions}</div>
            </CardContent>
          </Card>
        </div>

        {/* Folders */}
        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-bold">المجلدات الرئيسية</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setFolderDialogOpen(true)}
              >
                <Plus className="ml-2 h-4 w-4" />
                مجلد جديد
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {folders.length === 0 ? (
              <EmptyState
                icon={FolderOpen}
                title="لا توجد مجلدات"
                description="ابدأ بإنشاء مجلد جديد لتنظيم مستنداتك"
                actionLabel="إنشاء مجلد"
                onAction={() => setFolderDialogOpen(true)}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {folders.map((folder, index) => {
                  const colors = [
                    "bg-primary/10 text-primary",
                    "bg-success/10 text-success",
                    "bg-warning/10 text-warning",
                    "bg-accent/10 text-accent",
                  ];
                  const color = colors[index % colors.length];
                  
                  return (
                    <div
                      key={folder.id}
                      className="p-4 rounded-lg border border-border hover:border-primary hover:shadow-soft transition-all duration-300 cursor-pointer group"
                    >
                      <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center mb-3`}>
                        <FolderOpen className="h-6 w-6" />
                      </div>
                      <h3 className="font-medium text-foreground group-hover:text-primary transition-colors mb-2">
                        {folder.name}
                      </h3>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{folder.files_count} ملف</span>
                      </div>
                      {folder.description && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          {folder.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Files */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-xl font-bold">المستندات الأخيرة</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredDocuments.length === 0 ? (
              <EmptyState
                icon={FileText}
                title={searchQuery ? "لا توجد نتائج" : "لا توجد مستندات"}
                description={
                  searchQuery
                    ? "جرب استخدام كلمات بحث أخرى"
                    : "ابدأ برفع أول مستند"
                }
                actionLabel={searchQuery ? undefined : "رفع مستند"}
                onAction={searchQuery ? undefined : () => setUploadDialogOpen(true)}
              />
            ) : (
              <div className="space-y-3">
                {filteredDocuments.slice(0, 10).map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {file.name}
                        </h4>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span>
                            {format(new Date(file.uploaded_at), "dd MMM yyyy", { locale: ar })}
                          </span>
                          <span>•</span>
                          <Badge variant="outline" className="text-xs">
                            {file.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-left">
                        <div className="text-sm font-medium">{file.file_type}</div>
                        <div className="text-xs text-muted-foreground">{file.file_size}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

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
      </div>
    </div>
  );
};

export default Archive;
