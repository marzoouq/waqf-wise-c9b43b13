/**
 * Dialogs Component for Requests Page
 * نوافذ الحوار للطلبات
 */
import { memo } from 'react';
import { RequestApprovalDialog } from './RequestApprovalDialog';
import { RequestCommentsDialog } from './RequestCommentsDialog';
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog';
import type { FullRequest } from '@/types/request.types';

interface RequestsDialogsProps {
  selectedRequest: FullRequest | null;
  approvalDialogOpen: boolean;
  setApprovalDialogOpen: (open: boolean) => void;
  commentsDialogOpen: boolean;
  setCommentsDialogOpen: (open: boolean) => void;
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
  requestToDelete: FullRequest | null;
  handleDeleteConfirm: () => void;
  isDeleting: boolean;
}

export const RequestsDialogs = memo(({
  selectedRequest,
  approvalDialogOpen,
  setApprovalDialogOpen,
  commentsDialogOpen,
  setCommentsDialogOpen,
  deleteDialogOpen,
  setDeleteDialogOpen,
  requestToDelete,
  handleDeleteConfirm,
  isDeleting,
}: RequestsDialogsProps) => (
  <>
    {selectedRequest && (
      <>
        <RequestApprovalDialog
          open={approvalDialogOpen}
          onOpenChange={setApprovalDialogOpen}
          requestId={selectedRequest.id}
          requestType={selectedRequest.request_type && 'name' in selectedRequest.request_type 
            ? selectedRequest.request_type.name 
            : "طلب"}
          requestDescription={selectedRequest.description}
        />
        <RequestCommentsDialog
          open={commentsDialogOpen}
          onOpenChange={setCommentsDialogOpen}
          requestId={selectedRequest.id}
          requestNumber={selectedRequest.request_number}
        />
      </>
    )}
    
    <DeleteConfirmDialog
      open={deleteDialogOpen}
      onOpenChange={setDeleteDialogOpen}
      onConfirm={handleDeleteConfirm}
      title="حذف الطلب"
      description="هل أنت متأكد من حذف هذا الطلب؟"
      itemName={requestToDelete ? `${requestToDelete.request_number} - ${requestToDelete.description}` : ""}
      isLoading={isDeleting}
    />
  </>
));

RequestsDialogs.displayName = 'RequestsDialogs';
