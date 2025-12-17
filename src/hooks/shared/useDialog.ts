/**
 * Hook موحد لإدارة الـ Dialogs
 * يبسط إدارة حالة فتح/إغلاق الـ dialogs
 * v2.9.34
 */

import { useState, useCallback } from 'react';

interface DialogState<T = unknown> {
  isOpen: boolean;
  data: T | null;
}

interface UseDialogReturn<T = unknown> {
  /** حالة فتح الـ dialog */
  isOpen: boolean;
  /** البيانات المرتبطة */
  data: T | null;
  /** فتح الـ dialog */
  open: (data?: T) => void;
  /** إغلاق الـ dialog */
  close: () => void;
  /** تبديل حالة الـ dialog */
  toggle: () => void;
  /** تحديث البيانات */
  setData: (data: T | null) => void;
  /** handler لـ onOpenChange */
  onOpenChange: (open: boolean) => void;
}

/**
 * Hook لإدارة dialog واحد
 * 
 * @example
 * ```tsx
 * const editDialog = useDialog<User>();
 * 
 * // فتح مع بيانات
 * <Button onClick={() => editDialog.open(user)}>تعديل</Button>
 * 
 * // في الـ Dialog
 * <Dialog open={editDialog.isOpen} onOpenChange={editDialog.onOpenChange}>
 *   <UserForm user={editDialog.data} />
 * </Dialog>
 * ```
 */
export function useDialog<T = unknown>(initialOpen = false): UseDialogReturn<T> {
  const [state, setState] = useState<DialogState<T>>({
    isOpen: initialOpen,
    data: null,
  });

  const open = useCallback((data?: T) => {
    setState({
      isOpen: true,
      data: data ?? null,
    });
  }, []);

  const close = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  const toggle = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isOpen: !prev.isOpen,
    }));
  }, []);

  const setData = useCallback((data: T | null) => {
    setState((prev) => ({
      ...prev,
      data,
    }));
  }, []);

  const onOpenChange = useCallback((open: boolean) => {
    setState((prev) => ({
      ...prev,
      isOpen: open,
    }));
  }, []);

  return {
    isOpen: state.isOpen,
    data: state.data,
    open,
    close,
    toggle,
    setData,
    onOpenChange,
  };
}

/**
 * Hook لإدارة عدة dialogs
 * 
 * @example
 * ```tsx
 * const dialogs = useMultipleDialogs(['create', 'edit', 'delete'] as const);
 * 
 * dialogs.open('edit', user);
 * dialogs.isOpen('edit'); // true
 * dialogs.getData('edit'); // user
 * ```
 */
export function useMultipleDialogs<K extends string, T = unknown>(
  dialogKeys: readonly K[]
) {
  const [states, setStates] = useState<Record<K, DialogState<T>>>(() => {
    const initial = {} as Record<K, DialogState<T>>;
    dialogKeys.forEach((key) => {
      initial[key] = { isOpen: false, data: null };
    });
    return initial;
  });

  const open = useCallback((key: K, data?: T) => {
    setStates((prev) => ({
      ...prev,
      [key]: { isOpen: true, data: data ?? null },
    }));
  }, []);

  const close = useCallback((key: K) => {
    setStates((prev) => ({
      ...prev,
      [key]: { ...prev[key], isOpen: false },
    }));
  }, []);

  const closeAll = useCallback(() => {
    setStates((prev) => {
      const next = { ...prev };
      dialogKeys.forEach((key) => {
        next[key] = { ...next[key], isOpen: false };
      });
      return next;
    });
  }, [dialogKeys]);

  const isOpen = useCallback((key: K) => states[key]?.isOpen ?? false, [states]);
  const getData = useCallback((key: K) => states[key]?.data ?? null, [states]);

  const onOpenChange = useCallback((key: K) => (open: boolean) => {
    setStates((prev) => ({
      ...prev,
      [key]: { ...prev[key], isOpen: open },
    }));
  }, []);

  return {
    states,
    open,
    close,
    closeAll,
    isOpen,
    getData,
    onOpenChange,
  };
}

export default useDialog;
