/**
 * KeyboardShortcutsHelp - دليل اختصارات لوحة المفاتيح
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard, Command } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { framerVariants } from '@/lib/motion-system';

interface ShortcutItem {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  description: string;
}

interface ShortcutCategory {
  name: string;
  shortcuts: ShortcutItem[];
}

const SHORTCUT_CATEGORIES: ShortcutCategory[] = [
  {
    name: 'التنقل',
    shortcuts: [
      { key: 'H', alt: true, description: 'الصفحة الرئيسية' },
      { key: 'D', alt: true, description: 'لوحة التحكم' },
      { key: 'B', alt: true, description: 'المستفيدين' },
      { key: 'P', alt: true, description: 'العقارات' },
      { key: 'A', alt: true, description: 'المحاسبة' },
      { key: '←', alt: true, description: 'العودة للخلف' },
      { key: '→', alt: true, description: 'التقدم للأمام' },
    ],
  },
  {
    name: 'البحث والإجراءات',
    shortcuts: [
      { key: 'K', ctrl: true, description: 'فتح البحث السريع' },
      { key: '/', description: 'التركيز على البحث' },
      { key: 'N', alt: true, description: 'إنشاء عنصر جديد' },
      { key: 'S', ctrl: true, description: 'حفظ' },
    ],
  },
  {
    name: 'عام',
    shortcuts: [
      { key: 'Esc', description: 'إغلاق النافذة الحالية' },
      { key: '?', shift: true, description: 'عرض هذا الدليل' },
      { key: 'Tab', description: 'التنقل بين العناصر' },
      { key: 'Enter', description: 'تأكيد / تفعيل' },
    ],
  },
];

interface KeyboardShortcutsHelpProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsHelp({ open, onOpenChange }: KeyboardShortcutsHelpProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            اختصارات لوحة المفاتيح
          </DialogTitle>
          <DialogDescription>
            استخدم هذه الاختصارات للتنقل السريع في التطبيق
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {SHORTCUT_CATEGORIES.map((category) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {category.name}
              </h3>
              <div className="grid gap-2">
                {category.shortcuts.map((shortcut, index) => (
                  <ShortcutRow key={index} shortcut={shortcut} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t text-center">
          <p className="text-xs text-muted-foreground">
            اضغط <KeyBadge>Shift</KeyBadge> + <KeyBadge>?</KeyBadge> في أي وقت لعرض هذا الدليل
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ==================== Shortcut Row ====================

interface ShortcutRowProps {
  shortcut: ShortcutItem;
}

function ShortcutRow({ shortcut }: ShortcutRowProps) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/50 hover:bg-muted transition-colors">
      <span className="text-sm">{shortcut.description}</span>
      <div className="flex items-center gap-1">
        {shortcut.ctrl && <KeyBadge>Ctrl</KeyBadge>}
        {shortcut.alt && <KeyBadge>Alt</KeyBadge>}
        {shortcut.shift && <KeyBadge>Shift</KeyBadge>}
        {shortcut.meta && <KeyBadge><Command className="h-3 w-3" /></KeyBadge>}
        {(shortcut.ctrl || shortcut.alt || shortcut.shift || shortcut.meta) && (
          <span className="text-muted-foreground mx-1">+</span>
        )}
        <KeyBadge>{shortcut.key}</KeyBadge>
      </div>
    </div>
  );
}

// ==================== Key Badge ====================

interface KeyBadgeProps {
  children: React.ReactNode;
  className?: string;
}

function KeyBadge({ children, className }: KeyBadgeProps) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center',
        'min-w-[24px] h-6 px-1.5',
        'rounded border border-border/50',
        'bg-background shadow-sm',
        'text-xs font-mono font-medium',
        className
      )}
    >
      {children}
    </kbd>
  );
}

// ==================== Floating Shortcut Hint ====================

interface ShortcutHintProps {
  shortcut: string;
  description?: string;
  className?: string;
}

export function ShortcutHint({ shortcut, description, className }: ShortcutHintProps) {
  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      {description && (
        <span className="text-xs text-muted-foreground">{description}</span>
      )}
      <KeyBadge>{shortcut}</KeyBadge>
    </div>
  );
}

export default KeyboardShortcutsHelp;
