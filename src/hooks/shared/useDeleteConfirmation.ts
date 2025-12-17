/**
 * Hook موحد لتأكيد الحذف
 * يوحد 488 handleDelete pattern في 33 ملف
 * v2.9.34
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface UseDeleteConfirmationOptions<T = string> {
  /** دالة الحذف الفعلية */
  onDelete: (id: T) => Promise<void> | void;
  /** رسالة النجاح */
  successMessage?: string;
  /** رسالة الخطأ */
  errorMessage?: string;
  /** عنوان الـ dialog */
  title?: string;
  /** وصف الـ dialog */
  description?: string;
  /** دالة تُنفذ بعد النجاح */
  onSuccess?: () => void;
  /** دالة تُنفذ بعد الخطأ */
  onError?: (error: Error) => void;
  /** هل العملية مدمرة (destructive) */
  isDestructive?: boolean;
}

interface DeleteState<T> {
  isOpen: boolean;
  itemId: T | null;
  itemName: string | null;
  isLoading: boolean;
}

interface UseDeleteConfirmationReturn<T> {
  /** فتح dialog التأكيد */
  confirmDelete: (id: T, itemName?: string) => void;
  /** إغلاق الـ dialog */
  cancelDelete: () => void;
  /** تنفيذ الحذف */
  executeDelete: () => Promise<void>;
  /** حالة التحميل */
  isDeleting: boolean;
  /** حالة فتح الـ dialog */
  isOpen: boolean;
  /** الـ ID المحدد للحذف */
  selectedId: T | null;
  /** اسم العنصر */
  itemName: string | null;
  /** handler لـ onOpenChange */
  onOpenChange: (open: boolean) => void;
  /** العنوان */
  dialogTitle: string;
  /** الوصف */
  dialogDescription: string;
  /** هل destructive */
  dialogIsDestructive: boolean;
}

/**
 * Hook موحد لتأكيد الحذف
 * 
 * @example
 * const {
 *   confirmDelete,
 *   isOpen,
 *   isDeleting,
 *   executeDelete,
 *   onOpenChange,
 *   itemName,
 *   dialogTitle,
 *   dialogDescription,
 *   dialogIsDestructive,
 * } = useDeleteConfirmation({
 *   onDelete: async (id) => await deleteUser(id),
 *   successMessage: 'تم حذف المستخدم بنجاح',
 *   title: 'حذف المستخدم',
 *   description: 'هل أنت متأكد من حذف هذا المستخدم؟',
 *   onSuccess: () => refetch(),
 * });
 * 
 * // في JSX
 * <Button onClick={() => confirmDelete(userId, userName)}>حذف</Button>
 * <DeleteConfirmDialog
 *   open={isOpen}
 *   onOpenChange={onOpenChange}
 *   onConfirm={executeDelete}
 *   title={dialogTitle}
 *   description={dialogDescription}
 *   itemName={itemName}
 *   isLoading={isDeleting}
 *   isDestructive={dialogIsDestructive}
 * />
 */
export function useDeleteConfirmation<T = string>({
  onDelete,
  successMessage = 'تم الحذف بنجاح',
  errorMessage = 'حدث خطأ أثناء الحذف',
  title = 'تأكيد الحذف',
  description = 'هل أنت متأكد من حذف هذا العنصر؟',
  onSuccess,
  onError,
  isDestructive = true,
}: UseDeleteConfirmationOptions<T>): UseDeleteConfirmationReturn<T> {
  const [state, setState] = useState<DeleteState<T>>({
    isOpen: false,
    itemId: null,
    itemName: null,
    isLoading: false,
  });

  const confirmDelete = useCallback((id: T, itemName?: string) => {
    setState({
      isOpen: true,
      itemId: id,
      itemName: itemName ?? null,
      isLoading: false,
    });
  }, []);

  const cancelDelete = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isOpen: false,
      isLoading: false,
    }));
  }, []);

  const executeDelete = useCallback(async () => {
    if (state.itemId === null) return;

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      await onDelete(state.itemId);
      toast.success(successMessage);
      onSuccess?.();
      setState({
        isOpen: false,
        itemId: null,
        itemName: null,
        isLoading: false,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      toast.error(errorMessage);
      onError?.(err);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [state.itemId, onDelete, successMessage, errorMessage, onSuccess, onError]);

  const onOpenChange = useCallback((open: boolean) => {
    if (!open && !state.isLoading) {
      cancelDelete();
    }
  }, [state.isLoading, cancelDelete]);

  return {
    confirmDelete,
    cancelDelete,
    executeDelete,
    isDeleting: state.isLoading,
    isOpen: state.isOpen,
    selectedId: state.itemId,
    itemName: state.itemName,
    onOpenChange,
    dialogTitle: title,
    dialogDescription: description,
    dialogIsDestructive: isDestructive,
  };
}

export default useDeleteConfirmation;
