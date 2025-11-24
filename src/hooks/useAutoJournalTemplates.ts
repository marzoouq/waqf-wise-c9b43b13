import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type AutoJournalTemplateRow = Database['public']['Tables']['auto_journal_templates']['Row'];

export interface AutoJournalTemplate {
  id: string;
  trigger_event: string;
  template_name: string;
  description?: string;
  debit_accounts: Array<{
    account_code: string;
    percentage?: number;
    fixed_amount?: number;
  }>;
  credit_accounts: Array<{
    account_code: string;
    percentage?: number;
    fixed_amount?: number;
  }>;
  is_active: boolean;
  priority: number;
  created_at: string;
}

export interface AutoJournalTemplateInsert {
  trigger_event: string;
  template_name: string;
  description?: string;
  debit_accounts: any;
  credit_accounts: any;
  is_active?: boolean;
  priority?: number;
}

export function useAutoJournalTemplates() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: templates, isLoading } = useQuery({
    queryKey: ['auto_journal_templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('auto_journal_templates')
        .select('*')
        .order('priority', { ascending: false });

      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        debit_accounts: item.debit_accounts as any,
        credit_accounts: item.credit_accounts as any,
      })) as AutoJournalTemplate[];
    },
  });

  const createTemplate = useMutation({
    mutationFn: async (template: AutoJournalTemplateInsert) => {
      const { data, error } = await supabase
        .from('auto_journal_templates')
        .insert(template)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auto_journal_templates'] });
      toast({
        title: 'تم الحفظ',
        description: 'تم إنشاء قالب القيد التلقائي بنجاح',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateTemplate = useMutation({
    mutationFn: async ({ id, ...template }: Partial<AutoJournalTemplate> & { id: string }) => {
      const { data, error } = await supabase
        .from('auto_journal_templates')
        .update(template)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auto_journal_templates'] });
      toast({
        title: 'تم التحديث',
        description: 'تم تحديث قالب القيد التلقائي بنجاح',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('auto_journal_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auto_journal_templates'] });
      toast({
        title: 'تم الحذف',
        description: 'تم حذف قالب القيد التلقائي بنجاح',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('auto_journal_templates')
        .update({ is_active })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auto_journal_templates'] });
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
