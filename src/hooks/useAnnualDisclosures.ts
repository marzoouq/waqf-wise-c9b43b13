import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

export interface AnnualDisclosure {
  id: string;
  fiscal_year_id?: string;
  year: number;
  waqf_name: string;
  disclosure_date: string;
  total_revenues: number;
  total_expenses: number;
  net_income: number;
  nazer_share: number;
  nazer_percentage: number;
  charity_share: number;
  charity_percentage: number;
  corpus_share: number;
  corpus_percentage: number;
  total_beneficiaries: number;
  sons_count: number;
  daughters_count: number;
  wives_count: number;
  maintenance_expenses?: number;
  administrative_expenses?: number;
  development_expenses?: number;
  other_expenses?: number;
  opening_balance?: number;
  closing_balance?: number;
  bank_statement_url?: string;
  beneficiaries_details?: any;
  expenses_breakdown?: any;
  status: 'draft' | 'published' | 'archived';
  published_at?: string;
  published_by?: string;
  created_at: string;
  updated_at: string;
}

export interface DisclosureBeneficiary {
  id: string;
  disclosure_id: string;
  beneficiary_id: string;
  beneficiary_name: string;
  beneficiary_type: string;
  relationship?: string;
  allocated_amount: number;
  payments_count: number;
  created_at: string;
}

export function useAnnualDisclosures() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: disclosures = [], isLoading } = useQuery({
    queryKey: ["annual-disclosures"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("annual_disclosures")
        .select("*")
        .order("year", { ascending: false });

      if (error) throw error;
      return data as AnnualDisclosure[];
    },
  });

  const { data: currentYearDisclosure, isLoading: loadingCurrent } = useQuery({
    queryKey: ["annual-disclosure-current"],
    queryFn: async () => {
      const currentYear = new Date().getFullYear();
      const { data, error } = await supabase
        .from("annual_disclosures")
        .select("*")
        .eq("year", currentYear)
        .maybeSingle();

      if (error) throw error;
      return data as AnnualDisclosure | null;
    },
  });

  const generateDisclosure = useMutation({
    mutationFn: async ({ year, waqfName }: { year: number; waqfName: string }) => {
      const { data, error } = await supabase.rpc("generate_annual_disclosure", {
        p_year: year,
        p_waqf_name: waqfName,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["annual-disclosures"] });
      queryClient.invalidateQueries({ queryKey: ["annual-disclosure-current"] });
      toast({
        title: "تم إنشاء الإفصاح بنجاح",
        description: "تم توليد الإفصاح السنوي بنجاح",
      });
    },
    onError: (error: any) => {
      logger.error(error, { context: "generate_annual_disclosure" });
      toast({
        title: "خطأ في إنشاء الإفصاح",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const publishDisclosure = useMutation({
    mutationFn: async (disclosureId: string) => {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("annual_disclosures")
        .update({
          status: "published",
          published_at: new Date().toISOString(),
          published_by: userData.user?.id,
        })
        .eq("id", disclosureId)
        .select()
        .single();

      if (error) throw error;
      
      // إرسال إشعارات للمستفيدين
      try {
        await supabase.functions.invoke('notify-disclosure-published', {
          body: { disclosure_id: disclosureId }
        });
      } catch (err) {
        logger.error(err, { context: 'notify_disclosure_published' });
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["annual-disclosures"] });
      toast({
        title: "تم نشر الإفصاح",
        description: "أصبح الإفصاح متاحاً للمستفيدين وتم إرسال الإشعارات",
      });
    },
    onError: (error: any) => {
      logger.error(error, { context: "publish_disclosure" });
      toast({
        title: "خطأ في النشر",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    disclosures,
    currentYearDisclosure,
    isLoading: isLoading || loadingCurrent,
    generateDisclosure: generateDisclosure.mutateAsync,
    publishDisclosure: publishDisclosure.mutateAsync,
  };
}

export function useDisclosureBeneficiaries(disclosureId?: string) {
  const { data: beneficiaries = [], isLoading } = useQuery({
    queryKey: ["disclosure-beneficiaries", disclosureId],
    queryFn: async () => {
      if (!disclosureId) return [];

      const { data, error } = await supabase
        .from("disclosure_beneficiaries")
        .select("*")
        .eq("disclosure_id", disclosureId)
        .order("allocated_amount", { ascending: false });

      if (error) throw error;
      return data as DisclosureBeneficiary[];
    },
    enabled: !!disclosureId,
  });

  return {
    beneficiaries,
    isLoading,
  };
}
