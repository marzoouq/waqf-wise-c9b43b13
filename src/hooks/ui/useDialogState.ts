/**
 * Dialog State Hook - خطاف حالة المحاور
 * @version 2.8.30
 * 
 * يوفر إدارة موحدة لحالة فتح/إغلاق المحاور
 * بدلاً من تكرار useState في كل مكان
 */

import { useState, useCallback } from 'react';

interface DialogState<T = undefined> {
  isOpen: boolean;
  data: T | undefined;
  open: (data?: T) => void;
  close: () => void;
  toggle: () => void;
}

/**
 * خطاف موحد لإدارة حالة المحاور
 * @param initialOpen الحالة الأولية
 * @returns حالة المحاور مع دوال التحكم
 */
export function useDialogState<T = undefined>(
  initialOpen: boolean = false
): DialogState<T> {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [data, setData] = useState<T | undefined>(undefined);

  const open = useCallback((newData?: T) => {
    setData(newData);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // تأخير مسح البيانات للسماح بالـ animation
    setTimeout(() => setData(undefined), 300);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return { isOpen, data, open, close, toggle };
}

/**
 * خطاف لإدارة حالات متعددة للمحاور
 */
interface MultiDialogState {
  [key: string]: boolean;
}

export function useMultiDialogState(
  initialState: MultiDialogState = {}
): {
  dialogs: MultiDialogState;
  open: (key: string) => void;
  close: (key: string) => void;
  toggle: (key: string) => void;
  isOpen: (key: string) => boolean;
  closeAll: () => void;
} {
  const [dialogs, setDialogs] = useState<MultiDialogState>(initialState);

  const open = useCallback((key: string) => {
    setDialogs(prev => ({ ...prev, [key]: true }));
  }, []);

  const close = useCallback((key: string) => {
    setDialogs(prev => ({ ...prev, [key]: false }));
  }, []);

  const toggle = useCallback((key: string) => {
    setDialogs(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const isOpen = useCallback((key: string) => {
    return dialogs[key] || false;
  }, [dialogs]);

  const closeAll = useCallback(() => {
    setDialogs(prev => 
      Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {})
    );
  }, []);

  return { dialogs, open, close, toggle, isOpen, closeAll };
}

/**
 * خطاف لإدارة حالة التأكيد
 */
interface ConfirmState<T = undefined> {
  isOpen: boolean;
  data: T | undefined;
  confirm: (data?: T) => Promise<boolean>;
  cancel: () => void;
}

export function useConfirmDialog<T = undefined>(): ConfirmState<T> {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | undefined>(undefined);
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((newData?: T): Promise<boolean> => {
    setData(newData);
    setIsOpen(true);
    return new Promise<boolean>(resolve => {
      setResolvePromise(() => resolve);
    });
  }, []);

  const cancel = useCallback(() => {
    setIsOpen(false);
    if (resolvePromise) {
      resolvePromise(false);
      setResolvePromise(null);
    }
    setTimeout(() => setData(undefined), 300);
  }, [resolvePromise]);

  return { isOpen, data, confirm, cancel };
}
