import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useActivities } from "@/hooks/useActivities";
import { useAuth } from "@/hooks/auth/useAuth";
import { useEffect } from "react";
import type { Json } from '@/integrations/supabase/types';
import { logger } from "@/lib/logger";

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

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('waqf-units-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'waqf_units'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['waqf_units'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Fetch waqf units
  const { data: waqfUnits = [], isLoading } = useQuery({
    queryKey: ['waqf_units'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('waqf_units')
        .select('id, code, name, description, waqf_type, location, acquisition_date, acquisition_value, current_value, annual_return, documents, is_active, notes, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WaqfUnit[];
    },
  });

  // Get waqf unit by ID with related data
  const getWaqfUnitWithDetails = async (id: string) => {
    const { data: unit, error: unitError } = await supabase
      .from('waqf_units')
      .select('id, code, name, description, waqf_type, location, acquisition_date, acquisition_value, current_value, annual_return, documents, is_active, notes, created_at, updated_at')
      .eq('id', id)
      .single();

    if (unitError) throw unitError;

    // Get related properties
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('id, name, type, monthly_revenue, status')
      .eq('waqf_unit_id', id);

    if (propertiesError) throw propertiesError;

    // Get related funds
    const { data: funds, error: fundsError } = await supabase
      .from('funds')
      .select('id, name, allocated_amount, spent_amount, category')
      .eq('waqf_unit_id', id);

    if (fundsError) throw fundsError;

    return {
      ...unit,
      properties: properties || [],
      funds: funds || [],
    };
  };

  // Add waqf unit mutation
  const addWaqfUnit = useMutation({
    mutationFn: async (waqfUnit: Omit<WaqfUnit, 'id' | 'code' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('waqf_units')
        .insert([{ ...waqfUnit, code: '' }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
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

  // Update waqf unit mutation
  const updateWaqfUnit = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WaqfUnit> & { id: string }) => {
      const { data, error } = await supabase
        .from('waqf_units')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['waqf_units'] });
      
      addActivity({
        action: `تم تحديث قلم الوقف: ${data.name} (${data.code})`,
        user_name: user?.user_metadata?.full_name || 'مستخدم',
      }).catch((error) => {
        logger.error(error, { context: 'update_waqf_unit_activity', severity: 'low' });
      });

      toast({
        title: "تم تحديث القلم بنجاح",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "خطأ في تحديث القلم",
        description: error.message,
      });
    },
  });

  // Delete waqf unit mutation
  const deleteWaqfUnit = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('waqf_units')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waqf_units'] });
      
      addActivity({
        action: 'تم حذف قلم وقف',
        user_name: user?.user_metadata?.full_name || 'مستخدم',
      }).catch((error) => {
        logger.error(error, { context: 'delete_waqf_unit_activity', severity: 'low' });
      });

      toast({
        title: "تم حذف القلم بنجاح",
      });
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
    getWaqfUnitWithDetails,
  };
}
