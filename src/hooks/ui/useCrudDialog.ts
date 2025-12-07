import { useState, useCallback } from "react";

/**
 * Custom Hook مشترك لإدارة محاورات CRUD
 * يوفر حالة ودوال مشتركة للمحاورات (إنشاء/تعديل/حذف)
 * 
 * @template T - نوع العنصر
 * @returns كائن يحتوي على حالة المحاور ودوال إدارتها
 */
export function useCrudDialog<T>() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  /**
   * فتح المحاور للتعديل على عنصر موجود
   */
  const handleEdit = useCallback((item: T) => {
    setSelectedItem(item);
    setDialogOpen(true);
  }, []);

  /**
   * فتح المحاور لإنشاء عنصر جديد
   */
  const handleCreate = useCallback(() => {
    setSelectedItem(null);
    setDialogOpen(true);
  }, []);

  /**
   * إغلاق المحاور وإعادة تعيين الحالة
   */
  const handleClose = useCallback(() => {
    setDialogOpen(false);
    setSelectedItem(null);
  }, []);

  /**
   * التبديل بين فتح وإغلاق المحاور
   */
  const toggleDialog = useCallback(() => {
    setDialogOpen((prev) => !prev);
    if (dialogOpen) {
      setSelectedItem(null);
    }
  }, [dialogOpen]);

  return {
    // الحالة
    dialogOpen,
    selectedItem,
    isEditMode: selectedItem !== null,

    // الدوال
    handleEdit,
    handleCreate,
    handleClose,
    toggleDialog,
    setDialogOpen,
    setSelectedItem,
  };
}
