/**
 * ArchiveDialogsContext
 * إدارة حالة الحوارات في صفحة الأرشيف
 * @version 2.9.15
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Database } from '@/integrations/supabase/types';

type Document = Database['public']['Tables']['documents']['Row'];

interface DialogState<T> {
  isOpen: boolean;
  data: T | null;
}

interface ArchiveDialogsContextValue {
  // Dialog States
  uploadDialog: { isOpen: boolean };
  folderDialog: { isOpen: boolean };
  previewDialog: DialogState<Document & { file_path: string }>;
  deleteDialog: DialogState<Document>;
  
  // Dialog Actions
  openUploadDialog: () => void;
  closeUploadDialog: () => void;
  openFolderDialog: () => void;
  closeFolderDialog: () => void;
  openPreviewDialog: (document: Document) => void;
  closePreviewDialog: () => void;
  openDeleteDialog: (document: Document) => void;
  closeDeleteDialog: () => void;
  
  // Selected States
  selectedDocument: (Document & { file_path: string }) | null;
  documentToDelete: Document | null;
}

const ArchiveDialogsContext = createContext<ArchiveDialogsContextValue | null>(null);

interface ArchiveDialogsProviderProps {
  children: ReactNode;
}

export function ArchiveDialogsProvider({ children }: ArchiveDialogsProviderProps) {
  // Upload Dialog State
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  
  // Folder Dialog State
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  
  // Preview Dialog State
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<(Document & { file_path: string }) | null>(null);
  
  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);

  // Upload Dialog Actions
  const openUploadDialog = useCallback(() => setUploadDialogOpen(true), []);
  const closeUploadDialog = useCallback(() => setUploadDialogOpen(false), []);

  // Folder Dialog Actions
  const openFolderDialog = useCallback(() => setFolderDialogOpen(true), []);
  const closeFolderDialog = useCallback(() => setFolderDialogOpen(false), []);

  // Preview Dialog Actions
  const openPreviewDialog = useCallback((document: Document) => {
    setSelectedDocument({ ...document, file_path: document.file_path || `/documents/${document.id}` });
    setPreviewDialogOpen(true);
  }, []);

  const closePreviewDialog = useCallback(() => {
    setPreviewDialogOpen(false);
    setTimeout(() => setSelectedDocument(null), 200);
  }, []);

  // Delete Dialog Actions
  const openDeleteDialog = useCallback((document: Document) => {
    setDocumentToDelete(document);
    setDeleteDialogOpen(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false);
    setTimeout(() => setDocumentToDelete(null), 200);
  }, []);

  const value: ArchiveDialogsContextValue = {
    uploadDialog: { isOpen: uploadDialogOpen },
    folderDialog: { isOpen: folderDialogOpen },
    previewDialog: { isOpen: previewDialogOpen, data: selectedDocument },
    deleteDialog: { isOpen: deleteDialogOpen, data: documentToDelete },
    openUploadDialog,
    closeUploadDialog,
    openFolderDialog,
    closeFolderDialog,
    openPreviewDialog,
    closePreviewDialog,
    openDeleteDialog,
    closeDeleteDialog,
    selectedDocument,
    documentToDelete,
  };

  return (
    <ArchiveDialogsContext.Provider value={value}>
      {children}
    </ArchiveDialogsContext.Provider>
  );
}

export function useArchiveDialogsContext(): ArchiveDialogsContextValue {
  const context = useContext(ArchiveDialogsContext);
  if (!context) {
    throw new Error('useArchiveDialogsContext must be used within ArchiveDialogsProvider');
  }
  return context;
}
