import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

export interface AccountMapping {
  account_code: string;
  percentage?: number;
  fixed_amount?: number;
}

export interface AutoJournalTemplate {
  id: string;
  trigger_event: string;
  template_name: string;
  description?: string;
  debit_accounts: AccountMapping[];
  credit_accounts: AccountMapping[];
  is_active: boolean;
  priority: number;
  created_at: string;
}

export interface AutoJournalTemplateInsert {
  trigger_event: string;
  template_name: string;
  description?: string;
  debit_accounts: AccountMapping[];
  credit_accounts: AccountMapping[];
  is_active?: boolean;
  priority?: number;
}

function parseAccountMappings(data: Json): AccountMapping[] {
  if (!data || !Array.isArray(data)) return [];
  return data as unknown as AccountMapping[];
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
        debit_accounts: parseAccountMappings(item.debit_accounts),
        credit_accounts: parseAccountMappings(item.credit_accounts),
        is_active: item.is_active ?? false,
        priority: item.priority ?? 0,
      })) as AutoJournalTemplate[];
    },
  });

  const createTemplate = useMutation({
    mutationFn: async (template: AutoJournalTemplateInsert) => {
      const { data, error } = await supabase
        .from('auto_journal_templates')
        .insert({
          trigger_event: template.trigger_event,
          template_name: template.template_name,
          description: template.description,
          debit_accounts: template.debit_accounts as unknown as Json,
          credit_accounts: template.credit_accounts as unknown as Json,
          is_active: template.is_active,
          priority: template.priority,
        })
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
      const updateData: Record<string, unknown> = { ...template };
      if (template.debit_accounts) {
        updateData.debit_accounts = template.debit_accounts as unknown as Json;
      }
      if (template.credit_accounts) {
        updateData.credit_accounts = template.credit_accounts as unknown as Json;
      }
      
      const { data, error } = await supabase
        .from('auto_journal_templates')
        .update(updateData)
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
