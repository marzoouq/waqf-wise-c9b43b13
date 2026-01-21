import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/ui/use-toast";
import BeneficiaryDialog from "@/components/beneficiary/admin/BeneficiaryDialog";
import { PropertyDialog } from "@/components/properties/PropertyDialog";
import { DistributionDialog } from "@/components/funds/DistributionDialog";
import { AdminSendMessageDialog } from "@/components/messages/AdminSendMessageDialog";
import { PropertyService } from "@/services/property.service";
import { DistributionService } from "@/services/distribution.service";
import { supabase } from "@/integrations/supabase/client";

// أنواع محددة للنماذج
interface BeneficiaryFormData {
  full_name: string;
  national_id: string;
  phone: string;
  category: string;
  status?: string;
  email?: string;
  address?: string;
}

interface PropertyFormData {
  name: string;
  type: string;
  status: string;
  location: string;
  total_units?: number;
  description?: string;
}

interface DistributionFormData {
  totalAmount: number;
  beneficiaries: number;
  notes?: string;
  month: string;
}

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

  const handleSaveBeneficiary = async (data: BeneficiaryFormData) => {
    try {
      const { error } = await supabase.from("beneficiaries").insert(data);
      if (error) throw error;
      
      toast({
        title: "تم الإضافة",
        description: "تم إضافة المستفيد بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["beneficiaries"] });
      setBeneficiaryDialogOpen(false);
    } catch (error) {
      console.error("Error saving beneficiary:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة المستفيد",
        variant: "destructive",
      });
    }
  };

  const handleSaveProperty = async (data: PropertyFormData) => {
    try {
      await PropertyService.create(data);
      toast({
        title: "تم الإضافة",
        description: "تم إضافة العقار بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      setPropertyDialogOpen(false);
    } catch (error) {
      console.error("Error saving property:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة العقار",
        variant: "destructive",
      });
    }
  };

  const handleDistribute = async (data: DistributionFormData) => {
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
      queryClient.invalidateQueries({ queryKey: ["distributions"] });
      setDistributionDialogOpen(false);
    } catch (error) {
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
