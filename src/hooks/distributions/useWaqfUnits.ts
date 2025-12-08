import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useActivities } from "@/hooks/useActivities";
import { useAuth } from "@/hooks/auth/useAuth";
import { useEffect } from "react";
import type { Json } from '@/integrations/supabase/types';
import { logger } from "@/lib/logger";
import { FundService } from "@/services/fund.service";
import { supabase } from "@/integrations/supabase/client";

export interface WaqfUnit {
  id: string;
  code: string;
  name: string;
  description?: string;
  waqf_type: 'عقار' | 'نقدي' | 'أسهم' | 'مشروع';
  location?: string;
  acquisition_date?: string;
  acquisition_value?: number;
  current_value?: number;
  annual_return?: number;
  documents?: Json;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export function useWaqfUnits() {
  const { toast } = useToast();
  const { addActivity } = useActivities();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('waqf-units-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'waqf_units' }, () => {
        queryClient.invalidateQueries({ queryKey: ['waqf_units'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const { data: waqfUnits = [], isLoading } = useQuery({
    queryKey: ['waqf_units'],
    queryFn: () => FundService.getWaqfUnits(),
  });

  const addWaqfUnit = useMutation({
    mutationFn: (waqfUnit: Omit<WaqfUnit, 'id' | 'code' | 'created_at' | 'updated_at'>) => 
      FundService.createWaqfUnit({ ...waqfUnit, code: '' }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['waqf_units'] });
      
      addActivity({
        action: `تم إضافة قلم وقف جديد: ${data.name} (${data.code})`,
        user_name: user?.user_metadata?.full_name || 'مستخدم',
      }).catch((error) => {
        logger.error(error, { context: 'add_waqf_unit_activity', severity: 'low' });
      });

      toast({
        title: "تم إضافة القلم بنجاح",
        description: `كود القلم: ${data.code}`,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "خطأ في إضافة القلم",
        description: error.message,
      });
    },
  });

  const updateWaqfUnit = useMutation({
    mutationFn: ({ id, ...updates }: Partial<WaqfUnit> & { id: string }) => 
      FundService.updateWaqfUnit(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['waqf_units'] });
      
      addActivity({
        action: `تم تحديث قلم الوقف: ${data.name} (${data.code})`,
        user_name: user?.user_metadata?.full_name || 'مستخدم',
      }).catch((error) => {
        logger.error(error, { context: 'update_waqf_unit_activity', severity: 'low' });
      });

      toast({ title: "تم تحديث القلم بنجاح" });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "خطأ في تحديث القلم",
        description: error.message,
      });
    },
  });

  const deleteWaqfUnit = useMutation({
    mutationFn: (id: string) => FundService.deleteWaqfUnit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waqf_units'] });
      
      addActivity({
        action: 'تم حذف قلم وقف',
        user_name: user?.user_metadata?.full_name || 'مستخدم',
      }).catch((error) => {
        logger.error(error, { context: 'delete_waqf_unit_activity', severity: 'low' });
      });

      toast({ title: "تم حذف القلم بنجاح" });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "خطأ في حذف القلم",
        description: error.message,
      });
    },
  });

  return {
    waqfUnits,
    isLoading,
    addWaqfUnit: addWaqfUnit.mutateAsync,
    updateWaqfUnit: updateWaqfUnit.mutateAsync,
    deleteWaqfUnit: deleteWaqfUnit.mutateAsync,
    getWaqfUnitWithDetails: FundService.getWaqfUnitWithDetails,
  };
}
