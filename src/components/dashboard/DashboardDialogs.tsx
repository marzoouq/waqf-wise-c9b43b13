import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/ui/use-toast";
import BeneficiaryDialog from "@/components/beneficiary/admin/BeneficiaryDialog";
import { PropertyDialog } from "@/components/properties/PropertyDialog";
import { DistributionDialog } from "@/components/funds/DistributionDialog";
import { AdminSendMessageDialog } from "@/components/messages/AdminSendMessageDialog";
import { PropertyService } from "@/services/property.service";
import { DistributionService } from "@/services/distribution.service";
import { BeneficiaryCoreService } from "@/services/beneficiary";
import type { Beneficiary } from "@/types/beneficiary";
import { QUERY_KEYS } from "@/lib/query-keys";

interface DashboardDialogsProps {
  beneficiaryDialogOpen: boolean;
  setBeneficiaryDialogOpen: (open: boolean) => void;
  propertyDialogOpen: boolean;
  setPropertyDialogOpen: (open: boolean) => void;
  distributionDialogOpen: boolean;
  setDistributionDialogOpen: (open: boolean) => void;
  messageDialogOpen: boolean;
  setMessageDialogOpen: (open: boolean) => void;
}

export function DashboardDialogs({
  beneficiaryDialogOpen,
  setBeneficiaryDialogOpen,
  propertyDialogOpen,
  setPropertyDialogOpen,
  distributionDialogOpen,
  setDistributionDialogOpen,
  messageDialogOpen,
  setMessageDialogOpen,
}: DashboardDialogsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSaveBeneficiary = async (data: Record<string, unknown>) => {
    try {
      await BeneficiaryCoreService.create(data as Omit<Beneficiary, 'id' | 'created_at' | 'updated_at'>);
      
      toast({
        title: "تم الإضافة",
        description: "تم إضافة المستفيد بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BENEFICIARIES });
      setBeneficiaryDialogOpen(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "خطأ غير معروف";
      toast({
        title: "خطأ",
        description: `حدث خطأ أثناء إضافة المستفيد: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  const handleSaveProperty = async (data: Parameters<typeof PropertyService.create>[0]) => {
    try {
      await PropertyService.create(data);
      toast({
        title: "تم الإضافة",
        description: "تم إضافة العقار بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROPERTIES });
      setPropertyDialogOpen(false);
    } catch (error: unknown) {
      console.error("Error saving property:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة العقار",
        variant: "destructive",
      });
    }
  };

  const handleDistribute = async (data: { totalAmount: number; beneficiaries: number; notes?: string; month: string }) => {
    try {
      await DistributionService.create({
        distribution_date: new Date().toISOString(),
        total_amount: data.totalAmount,
        beneficiaries_count: data.beneficiaries,
        notes: data.notes || null,
        status: "مكتمل",
        month: data.month,
      });
      toast({
        title: "تم الإنشاء",
        description: "تم إنشاء التوزيع بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DISTRIBUTIONS });
      setDistributionDialogOpen(false);
    } catch (error: unknown) {
      console.error("Error creating distribution:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء التوزيع",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <BeneficiaryDialog
        open={beneficiaryDialogOpen}
        onOpenChange={setBeneficiaryDialogOpen}
        onSave={handleSaveBeneficiary}
      />
      <PropertyDialog
        open={propertyDialogOpen}
        onOpenChange={setPropertyDialogOpen}
        onSave={handleSaveProperty}
      />
      <DistributionDialog
        open={distributionDialogOpen}
        onOpenChange={setDistributionDialogOpen}
        onDistribute={handleDistribute}
      />
      <AdminSendMessageDialog
        open={messageDialogOpen}
        onOpenChange={setMessageDialogOpen}
      />
    </>
  );
}
