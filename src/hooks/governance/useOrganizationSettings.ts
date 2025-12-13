import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { GovernanceService } from "@/services/governance.service";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface OrganizationSettings {
  id: string;
  organization_name_ar: string;
  organization_name_en: string | null;
  vat_registration_number: string;
  commercial_registration_number: string;
  address_ar: string;
  address_en: string | null;
  city: string;
  postal_code: string | null;
  country: string;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  governance_type?: string;
  nazer_name?: string | null;
  nazer_title?: string | null;
  nazer_appointment_date?: string | null;
  nazer_contact_phone?: string | null;
  nazer_contact_email?: string | null;
  waqf_type?: string | null;
  waqf_establishment_date?: string | null;
  waqf_registration_number?: string | null;
  waqf_deed_url?: string | null;
  created_at: string;
  updated_at: string;
}

export const useOrganizationSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: QUERY_KEYS.ORGANIZATION_SETTINGS,
    queryFn: () => GovernanceService.getOrganizationSettings(),
  });

  const saveMutation = useMutation({
    mutationFn: (values: Omit<OrganizationSettings, "id" | "created_at" | "updated_at">) =>
      GovernanceService.updateOrganizationSettings(settings?.id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORGANIZATION_SETTINGS });
      toast({
        title: "✅ تم الحفظ",
        description: "تم حفظ إعدادات المنشأة بنجاح",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    settings,
    isLoading,
    saveSettings: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
  };
};
