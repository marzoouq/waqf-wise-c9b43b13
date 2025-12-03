/**
 * Archive Folders Tab Component
 * تبويب المجلدات في الأرشيف
 */
import { Database } from "@/integrations/supabase/types";
import { Plus, Upload, FolderOpen, FileText, ChevronRight, Search, Eye, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Folder } from "@/hooks/useFolders";

type Document = Database['public']['Tables']['documents']['Row'];

interface ArchiveFoldersTabProps {
  folders: Folder[];
  filteredDocuments: Document[];
  selectedFolderId: string | null;
  selectedFolder?: Folder;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSelectFolder: (id: string | null) => void;
  onCreateFolder: () => void;
  onUploadDocument: () => void;
  onPreviewDocument: (doc: Document) => void;
  onDownloadDocument: (doc: Document) => void;
  onDeleteDocument: (doc: Document) => void;
}

export function ArchiveFoldersTab({
  folders,
  filteredDocuments,
  selectedFolderId,
  selectedFolder,
  searchQuery,
  onSearchChange,
  onSelectFolder,
  onCreateFolder,
  onUploadDocument,
  onPreviewDocument,
  onDownloadDocument,
  onDeleteDocument,
}: ArchiveFoldersTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={onCreateFolder} className="flex-1 sm:flex-none">
          <Plus className="ml-2 h-4 w-4" />
          إنشاء مجلد جديد
        </Button>
        <Button onClick={onUploadDocument} variant="outline" className="flex-1 sm:flex-none">
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
            onClick={() => onSelectFolder(null)}
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
                onClick={() => onSelectFolder(folder.id)}
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
              onChange={(e) => onSearchChange(e.target.value)}
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
                      <Button size="sm" variant="ghost" onClick={() => onPreviewDocument(doc)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => onDownloadDocument(doc)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => onDeleteDocument(doc)}
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
              <Button onClick={onUploadDocument} variant="outline" className="mt-4">
                <Upload className="ml-2 h-4 w-4" />
                رفع مستند
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
