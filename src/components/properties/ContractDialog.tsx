import { useMemo, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useContracts, Contract } from "@/hooks/property/useContracts";
import { useProperties } from "@/hooks/property/useProperties";
import { toast } from "@/hooks/ui/use-toast";
import { Lightbulb, Upload, FileText, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { 
  contractSchema, 
  ContractFormValues, 
  getDefaultValues, 
  contractToFormValues 
} from "./contract/contractSchema";
import { PropertyAndTenantFields } from "./contract/fields/PropertyAndTenantFields";
import { DurationAndAmountFields } from "./contract/fields/DurationAndAmountFields";
import { UnitsSelector } from "./contract/fields/UnitsSelector";
import { TaxFields } from "./contract/fields/TaxFields";
import { RenewalFields } from "./contract/fields/RenewalFields";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract?: Contract | null;
}

export const ContractDialog = ({ open, onOpenChange, contract }: Props) => {
  const { addContract, updateContract } = useContracts();
  const { properties } = useProperties();
  const isEditing = !!contract;
  
  // حالة رفع ملف العقد
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);

  // إنشاء النموذج مع react-hook-form + zod
  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: getDefaultValues(),
  });

  // تحميل بيانات العقد عند التعديل
  useEffect(() => {
    if (contract) {
      const values = contractToFormValues(contract);
      form.reset(values);
    } else if (open) {
      form.reset(getDefaultValues());
      setContractFile(null);
      setUploadedFileUrl(null);
    }
  }, [contract, open, form]);

  // رفع ملف العقد
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "خطأ", description: "حجم الملف يجب أن يكون أقل من 10 ميجابايت", variant: "destructive" });
      return;
    }
    
    setContractFile(file);
    setUploadingFile(true);
    
    try {
      const fileName = `ejar-contracts/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from('archive-documents').upload(fileName, file);
      
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage.from('archive-documents').getPublicUrl(fileName);
      setUploadedFileUrl(publicUrl);
      toast({ title: "تم رفع الملف بنجاح" });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({ title: "خطأ في رفع الملف", variant: "destructive" });
      setContractFile(null);
    } finally {
      setUploadingFile(false);
    }
  };

  // حسابات تلقائية للإيجار الشهري (للضريبة)
  const startDate = form.watch('start_date');
  const durationValue = form.watch('duration_value');
  const durationUnit = form.watch('duration_unit');
  const totalAmount = form.watch('total_amount');

  const monthlyRent = useMemo(() => {
    if (!startDate || !durationValue || !totalAmount) return null;
    const durationInMonths = durationUnit === 'سنوات' ? durationValue * 12 : durationValue;
    return totalAmount / durationInMonths;
  }, [startDate, durationValue, durationUnit, totalAmount]);

  // حساب تاريخ النهاية
  const endDate = useMemo(() => {
    if (!startDate || !durationValue) return null;
    const durationInMonths = durationUnit === 'سنوات' ? durationValue * 12 : durationValue;
    const start = new Date(startDate);
    const end = new Date(start);
    end.setMonth(start.getMonth() + durationInMonths);
    return end.toISOString().split('T')[0];
  }, [startDate, durationValue, durationUnit]);

  // إرسال النموذج
  const onSubmit = async (data: ContractFormValues) => {
    // التحقق من اختيار الوحدات عند الإضافة الجديدة
    if (!isEditing && data.unit_ids.length === 0) {
      form.setError('unit_ids', { 
        type: 'manual', 
        message: 'اختر وحدة واحدة على الأقل' 
      });
      toast({
        title: "خطأ في البيانات",
        description: "يرجى اختيار وحدة واحدة على الأقل",
        variant: "destructive",
      });
      return;
    }

    // حساب القيم المشتقة
    const durationInMonths = data.duration_unit === 'سنوات' 
      ? data.duration_value * 12 
      : data.duration_value;

    const calculatedEndDate = (() => {
      const start = new Date(data.start_date);
      start.setMonth(start.getMonth() + durationInMonths);
      return start.toISOString().split('T')[0];
    })();

    const calculatedMonthlyRent = data.total_amount / durationInMonths;

    const contractData = {
      contract_number: data.contract_number,
      property_id: data.property_id,
      tenant_id: data.tenant_id || undefined,
      tenant_name: data.tenant_name,
      tenant_phone: data.tenant_phone,
      tenant_id_number: data.tenant_id_number,
      tenant_email: data.tenant_email || undefined,
      contract_type: data.contract_type,
      start_date: data.start_date,
      end_date: calculatedEndDate,
      monthly_rent: calculatedMonthlyRent,
      security_deposit: data.security_deposit || 0,
      payment_frequency: data.payment_frequency,
      is_renewable: data.is_renewable,
      auto_renew: data.auto_renew,
      renewal_notice_days: data.renewal_notice_days,
      terms_and_conditions: data.terms_and_conditions || undefined,
      notes: data.notes || undefined,
      tax_percentage: data.tax_percentage,
      units_count: data.unit_ids.length,
      unit_ids: data.unit_ids,
    };

    try {
      if (contract) {
        await updateContract.mutateAsync({ id: contract.id, ...contractData });
      } else {
        await addContract.mutateAsync(contractData);
      }
      onOpenChange(false);
      form.reset(getDefaultValues());
    } catch (error) {
      console.error('Error saving contract:', error);
    }
  };

  return (
    <ResponsiveDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title={contract ? "تعديل عقد" : "إضافة عقد جديد"}
      description={contract ? "تعديل بيانات العقد" : "أدخل بيانات العقد الجديد"}
      size="xl"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {!isEditing && (
            <div className="bg-info/10 border border-info/30 rounded-lg p-3 text-sm mb-4">
              <p className="text-info-foreground">
                💡 <strong>ملاحظة:</strong> اختر العقار أولاً لعرض الوحدات المتاحة للتأجير
              </p>
            </div>
          )}
          
          <PropertyAndTenantFields 
            form={form}
            properties={properties}
            isEditing={isEditing}
          />

          <DurationAndAmountFields
            form={form}
            isEditing={isEditing}
          />

          {!isEditing && (
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertTitle>أمثلة سريعة:</AlertTitle>
              <AlertDescription className="space-y-1 text-xs">
                <p>• عقد 3 سنوات بمبلغ 360,000 ر.س ← إيجار شهري: 10,000 ر.س</p>
                <p>• عقد 18 شهر بمبلغ 90,000 ر.س ← إيجار شهري: 5,000 ر.س</p>
                <p>• عقد سنوي بدفعة واحدة ← يُسجل كامل المبلغ عند الدفع</p>
              </AlertDescription>
            </Alert>
          )}

          {!isEditing && form.watch('property_id') && (
            <UnitsSelector form={form} />
          )}

          <TaxFields
            form={form}
            monthlyRent={monthlyRent}
          />

          <RenewalFields form={form} />

          {/* قسم رفع عقد إيجار */}
          <div className="border rounded-lg p-4 bg-muted/30">
            <FormLabel className="flex items-center gap-2 mb-3">
              <Upload className="h-4 w-4" />
              أرشفة عقد منصة إيجار (اختياري)
            </FormLabel>
            <div className="flex items-center gap-3">
              <Input
                type="file"
                accept=".pdf,image/*"
                onChange={handleFileChange}
                disabled={uploadingFile}
                className="flex-1"
              />
              {uploadingFile && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
            {contractFile && (
              <div className="flex items-center gap-2 mt-2 p-2 bg-background rounded border">
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-sm flex-1">{contractFile.name}</span>
                {uploadedFileUrl && (
                  <a href={uploadedFileUrl} target="_blank" className="text-xs text-primary hover:underline">عرض</a>
                )}
                <Button type="button" variant="ghost" size="sm" onClick={() => { setContractFile(null); setUploadedFileUrl(null); }}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            <FormDescription className="mt-2">يمكنك رفع نسخة من عقد منصة إيجار للأرشفة</FormDescription>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto h-11 sm:h-10 text-base sm:text-sm"
            >
              إلغاء
            </Button>
            <Button 
              type="submit" 
              disabled={form.formState.isSubmitting}
              className="w-full sm:w-auto h-11 sm:h-10 text-base sm:text-sm"
            >
              {contract ? "تحديث" : "إضافة"}
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveDialog>
  );
};
