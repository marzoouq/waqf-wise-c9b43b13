/**
 * Hook لإدارة قوالب القيود التلقائية
 * @version 2.8.73 - Refactored to use AutoJournalService
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AutoJournalService, type AutoJournalTemplate, type AutoJournalTemplateInsert } from '@/services/accounting.service';
import { useToast } from '@/hooks/use-toast';
import { QUERY_KEYS } from '@/lib/query-keys';

export type { AutoJournalTemplate, AutoJournalTemplateInsert };
export type { AccountMapping } from '@/services/accounting.service';

export function useAutoJournalTemplates() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: templates, isLoading } = useQuery({
    queryKey: QUERY_KEYS.AUTO_JOURNAL_TEMPLATES,
    queryFn: () => AutoJournalService.getTemplates(),
  });

  const createTemplate = useMutation({
    mutationFn: (template: AutoJournalTemplateInsert) => AutoJournalService.createTemplate(template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTO_JOURNAL_TEMPLATES });
      toast({ title: 'تم الحفظ', description: 'تم إنشاء قالب القيد التلقائي بنجاح' });
    },
    onError: (error: Error) => {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    },
  });

  const updateTemplate = useMutation({
    mutationFn: ({ id, ...template }: Partial<AutoJournalTemplate> & { id: string }) => 
      AutoJournalService.updateTemplate(id, template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTO_JOURNAL_TEMPLATES });
      toast({ title: 'تم التحديث', description: 'تم تحديث قالب القيد التلقائي بنجاح' });
    },
    onError: (error: Error) => {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: (id: string) => AutoJournalService.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTO_JOURNAL_TEMPLATES });
      toast({ title: 'تم الحذف', description: 'تم حذف قالب القيد التلقائي بنجاح' });
    },
    onError: (error: Error) => {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    },
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) => 
      AutoJournalService.toggleActive(id, is_active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTO_JOURNAL_TEMPLATES });
    },
  });

  return {
    templates: templates || [],
    isLoading,
    createTemplate: createTemplate.mutateAsync,
    updateTemplate: updateTemplate.mutateAsync,
    deleteTemplate: deleteTemplate.mutateAsync,
    toggleActive: toggleActive.mutateAsync,
  };
}
