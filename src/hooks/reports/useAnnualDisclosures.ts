import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";
import { getErrorMessage } from "@/types/errors";
import type { Database } from "@/integrations/supabase/types";
import { ReportService } from "@/services";

type DbAnnualDisclosure = Database['public']['Tables']['annual_disclosures']['Row'];

export type AnnualDisclosure = DbAnnualDisclosure;

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
    queryFn: () => ReportService.getAnnualDisclosures(),
  });

  const { data: currentYearDisclosure, isLoading: loadingCurrent } = useQuery({
    queryKey: ["annual-disclosure-current"],
    queryFn: () => ReportService.getCurrentYearDisclosure(),
  });

  const generateDisclosure = useMutation({
    mutationFn: ({ year, waqfName }: { year: number; waqfName: string }) =>
      ReportService.generateAnnualDisclosure(year, waqfName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["annual-disclosures"] });
      queryClient.invalidateQueries({ queryKey: ["annual-disclosure-current"] });
      toast({
        title: "تم إنشاء الإفصاح بنجاح",
        description: "تم توليد الإفصاح السنوي بنجاح",
      });
    },
    onError: (error: unknown) => {
      logger.error(error, { context: "generate_annual_disclosure" });
      toast({
        title: "خطأ في إنشاء الإفصاح",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  const publishDisclosure = useMutation({
    mutationFn: (disclosureId: string) => ReportService.publishDisclosure(disclosureId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["annual-disclosures"] });
      toast({
        title: "تم نشر الإفصاح",
        description: "أصبح الإفصاح متاحاً للمستفيدين وتم إرسال الإشعارات",
      });
    },
    onError: (error: unknown) => {
      logger.error(error, { context: "publish_disclosure" });
      toast({
        title: "خطأ في النشر",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  return {
    disclosures: disclosures as AnnualDisclosure[],
    currentYearDisclosure: currentYearDisclosure as AnnualDisclosure | null,
    isLoading: isLoading || loadingCurrent,
    generateDisclosure: generateDisclosure.mutateAsync,
    publishDisclosure: publishDisclosure.mutateAsync,
  };
}

export function useDisclosureBeneficiaries(disclosureId?: string) {
  const { data: beneficiaries = [], isLoading } = useQuery({
    queryKey: ["disclosure-beneficiaries", disclosureId],
    queryFn: () => disclosureId ? ReportService.getDisclosureBeneficiaries(disclosureId) : [],
    enabled: !!disclosureId,
  });

  return {
    beneficiaries: beneficiaries as DisclosureBeneficiary[],
    isLoading,
  };
}
