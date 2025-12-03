/**
 * Archive Dialogs Component
 * نوافذ حوار الأرشيف
 */
import { memo } from 'react';
import { Database } from "@/integrations/supabase/types";
import { UploadDocumentDialog } from "@/components/archive/UploadDocumentDialog";
import { CreateFolderDialog } from "@/components/archive/CreateFolderDialog";
import { DocumentPreviewDialog } from "@/components/archive/DocumentPreviewDialog";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";

type Document = Database['public']['Tables']['documents']['Row'];

interface ArchiveDialogsProps {
  uploadDialogOpen: boolean;
  setUploadDialogOpen: (open: boolean) => void;
  folderDialogOpen: boolean;
  setFolderDialogOpen: (open: boolean) => void;
  previewDialogOpen: boolean;
  setPreviewDialogOpen: (open: boolean) => void;
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
  selectedDocument: (Document & { file_path: string }) | null;
  documentToDelete: Document | null;
  onCreateFolder: (data: Database['public']['Tables']['folders']['Insert']) => Promise<void>;
  onDeleteConfirm: () => Promise<void>;
}

export const ArchiveDialogs = memo(({
  uploadDialogOpen,
  setUploadDialogOpen,
  folderDialogOpen,
  setFolderDialogOpen,
  previewDialogOpen,
  setPreviewDialogOpen,
  deleteDialogOpen,
  setDeleteDialogOpen,
  selectedDocument,
  documentToDelete,
  onCreateFolder,
  onDeleteConfirm,
}: ArchiveDialogsProps) => (
  <>
    <UploadDocumentDialog
      open={uploadDialogOpen}
      onOpenChange={setUploadDialogOpen}
    />

    <CreateFolderDialog
      open={folderDialogOpen}
      onOpenChange={setFolderDialogOpen}
      onCreate={onCreateFolder}
    />

    <DocumentPreviewDialog
      open={previewDialogOpen}
      onOpenChange={setPreviewDialogOpen}
      document={selectedDocument}
    />

    <DeleteConfirmDialog
      open={deleteDialogOpen}
      onOpenChange={setDeleteDialogOpen}
      onConfirm={onDeleteConfirm}
      title="حذف المستند"
      description="هل أنت متأكد من حذف هذا المستند؟ لن يمكن استرجاعه بعد الحذف."
      itemName={documentToDelete?.name || ""}
    />
  </>
));

ArchiveDialogs.displayName = 'ArchiveDialogs';
