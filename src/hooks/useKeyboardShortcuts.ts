import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './use-toast';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      const matchedShortcut = shortcuts.find(
        (shortcut) =>
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          (!shortcut.ctrl || event.ctrlKey) &&
          (!shortcut.alt || event.altKey) &&
          (!shortcut.shift || event.shiftKey)
      );

      if (matchedShortcut) {
        event.preventDefault();
        matchedShortcut.action();
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);
}

// Keyboard shortcuts للبوابة
export function useBeneficiaryKeyboardShortcuts() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'h',
      alt: true,
      action: () => navigate('/beneficiary-dashboard'),
      description: 'الذهاب للصفحة الرئيسية',
    },
    {
      key: 'r',
      alt: true,
      action: () => {
        const tab = document.querySelector('[value="emergency"]') as HTMLElement;
        tab?.click();
      },
      description: 'فتح نموذج الفزعة',
    },
    {
      key: 'l',
      alt: true,
      action: () => {
        const tab = document.querySelector('[value="loan"]') as HTMLElement;
        tab?.click();
      },
      description: 'فتح نموذج القرض',
    },
    {
      key: 'm',
      alt: true,
      action: () => {
        const messageBtn = document.querySelector('[data-message-btn]') as HTMLElement;
        messageBtn?.click();
      },
      description: 'فتح الرسائل',
    },
    {
      key: '?',
      shift: true,
      action: () => {
        toast({
          title: 'اختصارات لوحة المفاتيح',
          description: 'Alt + H: الصفحة الرئيسية | Alt + R: طلب فزعة | Alt + L: طلب قرض | Alt + M: الرسائل',
        });
      },
      description: 'عرض قائمة الاختصارات',
    },
  ];

  useKeyboardShortcuts(shortcuts);

  return shortcuts;
}
