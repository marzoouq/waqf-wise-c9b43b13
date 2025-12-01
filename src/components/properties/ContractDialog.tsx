import { useState, useEffect, useCallback } from "react";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useContracts, Contract } from "@/hooks/useContracts";
import { useProperties } from "@/hooks/useProperties";
import { usePropertyUnits } from "@/hooks/usePropertyUnits";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { Calculator, Calendar, Banknote, CheckCircle2, Lightbulb } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIContractExtractor } from "./AIContractExtractor";
import { ContractInsert } from "@/types/contracts";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract?: Contract | null;
}

export const ContractDialog = ({ open, onOpenChange, contract }: Props) => {
  const { addContract, updateContract } = useContracts();
  const { properties, isLoading: propertiesLoading } = useProperties();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const { units, isLoading: unitsLoading } = usePropertyUnits(selectedPropertyId);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);

  // حقول جديدة مبسطة
  const [contractDuration, setContractDuration] = useState<number>(1);
  const [durationUnit, setDurationUnit] = useState<'سنوات' | 'أشهر'>('سنوات');
  const [totalAmount, setTotalAmount] = useState<string>('');

  const [formData, setFormData] = useState({
    contract_number: "",
    property_id: "",
    tenant_name: "",
    tenant_phone: "",
    tenant_id_number: "",
    tenant_email: "",
    contract_type: "إيجار",
    start_date: "",
    end_date: "",
    monthly_rent: "",
    security_deposit: "",
    payment_frequency: "شهري",
    is_renewable: true,
    auto_renew: false,
    renewal_notice_days: "60",
    terms_and_conditions: "",
    notes: "",
  });

  const calculateContractDetails = useCallback(() => {
    if (!formData.start_date || !contractDuration) return;

    const startDate = new Date(formData.start_date);
    const endDate = new Date(startDate);
    
    if (durationUnit === 'سنوات') {
      endDate.setFullYear(startDate.getFullYear() + contractDuration);
    } else {
      endDate.setMonth(startDate.getMonth() + contractDuration);
    }
    
    endDate.setDate(endDate.getDate() - 1);
    const calculatedEndDate = endDate.toISOString().split('T')[0];
    
    let calculatedMonthlyRent = '';
    if (totalAmount) {
      const total = parseFloat(totalAmount);
      const months = durationUnit === 'سنوات' ? contractDuration * 12 : contractDuration;
      calculatedMonthlyRent = (total / months).toFixed(2);
    }

    // فقط تحديث القيم إذا كانت مختلفة
    if (formData.end_date !== calculatedEndDate) {
      setFormData(prev => ({ ...prev, end_date: calculatedEndDate }));
    }
    if (calculatedMonthlyRent && formData.monthly_rent !== calculatedMonthlyRent) {
      setFormData(prev => ({ ...prev, monthly_rent: calculatedMonthlyRent }));
    }
  }, [formData.start_date, formData.end_date, formData.monthly_rent, contractDuration, durationUnit, totalAmount]);

  useEffect(() => {
    calculateContractDetails();
  }, [formData.start_date, contractDuration, durationUnit, totalAmount]);

  useEffect(() => {
    if (contract) {
      setFormData({
        contract_number: contract.contract_number,
        property_id: contract.property_id,
        tenant_name: contract.tenant_name,
        tenant_phone: contract.tenant_phone,
        tenant_id_number: contract.tenant_id_number,
        tenant_email: contract.tenant_email || "",
        contract_type: contract.contract_type,
        start_date: contract.start_date,
        end_date: contract.end_date,
        monthly_rent: contract.monthly_rent.toString(),
        security_deposit: contract.security_deposit?.toString() || "",
        payment_frequency: contract.payment_frequency,
        is_renewable: contract.is_renewable,
        auto_renew: contract.auto_renew,
        renewal_notice_days: contract.renewal_notice_days.toString(),
        terms_and_conditions: contract.terms_and_conditions || "",
        notes: contract.notes || "",
      });
      setSelectedPropertyId(contract.property_id);
    } else {
      resetForm();
    }
  }, [contract, open]);

  useEffect(() => {
    if (formData.property_id && formData.property_id !== selectedPropertyId) {
      setSelectedPropertyId(formData.property_id);
      setSelectedUnits([]);
    }
  }, [formData.property_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contract && selectedUnits.length === 0) {
      toast({
        title: "تحذير",
        description: "يرجى اختيار وحدة واحدة على الأقل",
        variant: "destructive",
      });
      return;
    }

    try {
      const contractData = {
        ...formData,
        monthly_rent: parseFloat(formData.monthly_rent),
        security_deposit: parseFloat(formData.security_deposit || "0"),
        renewal_notice_days: parseInt(formData.renewal_notice_days),
      };

      const contractPayload = {
        ...contractData,
        units_count: selectedUnits.length > 0 ? selectedUnits.length : undefined,
        ...(contract && { id: contract.id }),
      };

      if (contract) {
        await updateContract.mutateAsync(contractPayload);
      } else {
        await addContract.mutateAsync({
          ...contractData,
          units_count: selectedUnits.length > 0 ? selectedUnits.length : undefined,
          unit_ids: selectedUnits,
        });
      }

      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Error submitting contract:", error);
    }
  };

  const resetForm = () => {
    const contractNumber = `CNT-${Date.now()}`;
    setFormData({
      contract_number: contractNumber,
      property_id: "",
      tenant_name: "",
      tenant_phone: "",
      tenant_id_number: "",
      tenant_email: "",
      contract_type: "إيجار",
      start_date: "",
      end_date: "",
      monthly_rent: "",
      security_deposit: "",
      payment_frequency: "شهري",
      is_renewable: true,
      auto_renew: false,
      renewal_notice_days: "60",
      terms_and_conditions: "",
      notes: "",
    });
    setSelectedUnits([]);
    setSelectedPropertyId("");
    setContractDuration(1);
    setDurationUnit('سنوات');
    setTotalAmount('');
  };

  const availableUnits = units?.filter(u => u.status === 'available') || [];
  
  const toggleUnit = (unitId: string) => {
    setSelectedUnits(prev => 
      prev.includes(unitId) 
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    );
  };

  const handleAIExtracted = (data: Partial<ContractInsert>) => {
    setFormData(prev => ({
      ...prev,
      contract_number: data.contract_number || prev.contract_number,
      tenant_name: data.tenant_name || prev.tenant_name,
      tenant_phone: data.tenant_phone || prev.tenant_phone,
      tenant_id_number: data.tenant_id_number || prev.tenant_id_number,
      tenant_email: data.tenant_email || prev.tenant_email,
      contract_type: data.contract_type || prev.contract_type,
      start_date: data.start_date || prev.start_date,
      end_date: data.end_date || prev.end_date,
      monthly_rent: data.monthly_rent?.toString() || prev.monthly_rent,
      security_deposit: data.security_deposit?.toString() || prev.security_deposit,
      payment_frequency: data.payment_frequency || prev.payment_frequency,
      is_renewable: data.is_renewable !== undefined ? data.is_renewable : prev.is_renewable,
      terms_and_conditions: data.terms_and_conditions || prev.terms_and_conditions,
      notes: data.notes || prev.notes,
    }));
  };

  return (
    <ResponsiveDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title={contract ? "تعديل عقد" : "إضافة عقد جديد"}
      description={contract ? "تعديل بيانات العقد" : "أدخل بيانات العقد الجديد"}
      size="xl"
    >
      <Tabs defaultValue={contract ? "manual" : "ai"} className="w-full">
        {!contract && (
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="ai">استخراج بالذكاء الاصطناعي</TabsTrigger>
            <TabsTrigger value="manual">إدخال يدوي</TabsTrigger>
          </TabsList>
        )}

        {!contract && (
          <TabsContent value="ai">
            <AIContractExtractor onExtracted={handleAIExtracted} />
          </TabsContent>
        )}

        <TabsContent value="manual">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!contract && (
              <div className="bg-info/10 border border-info/30 rounded-lg p-3 text-sm mb-4">
                <p className="text-info-foreground">
                  💡 <strong>ملاحظة:</strong> اختر العقار أولاً لعرض الوحدات المتاحة للتأجير
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>العقار *</Label>
                <Select
                  value={formData.property_id}
                  onValueChange={(value) => setFormData({ ...formData, property_id: value })}
                  required
                  disabled={propertiesLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={propertiesLoading ? "جاري التحميل..." : properties?.length === 0 ? "لا توجد عقارات" : "اختر العقار"} />
                  </SelectTrigger>
                  <SelectContent>
                    {properties?.length === 0 && !propertiesLoading ? (
                      <div className="p-2 text-center text-sm text-muted-foreground">
                        لا توجد عقارات متاحة
                      </div>
                    ) : (
                      properties?.map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>رقم العقد *</Label>
                <Input
                  value={formData.contract_number}
                  onChange={(e) => setFormData({ ...formData, contract_number: e.target.value })}
                  placeholder="رقم العقد"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>اسم المستأجر *</Label>
                <Input
                  value={formData.tenant_name}
                  onChange={(e) => setFormData({ ...formData, tenant_name: e.target.value })}
                  placeholder="الاسم الكامل"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>رقم الهوية *</Label>
                <Input
                  value={formData.tenant_id_number}
                  onChange={(e) => setFormData({ ...formData, tenant_id_number: e.target.value })}
                  placeholder="رقم الهوية"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>رقم الجوال *</Label>
                <Input
                  value={formData.tenant_phone}
                  onChange={(e) => setFormData({ ...formData, tenant_phone: e.target.value })}
                  placeholder="05xxxxxxxx"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>البريد الإلكتروني</Label>
                <Input
                  type="email"
                  value={formData.tenant_email}
                  onChange={(e) => setFormData({ ...formData, tenant_email: e.target.value })}
                  placeholder="example@email.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>نوع العقد *</Label>
                <Select
                  value={formData.contract_type}
                  onValueChange={(value) => setFormData({ ...formData, contract_type: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="إيجار">إيجار</SelectItem>
                    <SelectItem value="تأجير">تأجير</SelectItem>
                    <SelectItem value="صيانة">صيانة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>تكرار الدفع *</Label>
                <Select
                  value={formData.payment_frequency}
                  onValueChange={(value) => setFormData({ ...formData, payment_frequency: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="شهري">شهري</SelectItem>
                    <SelectItem value="ربع سنوي">ربع سنوي</SelectItem>
                    <SelectItem value="نصف سنوي">نصف سنوي</SelectItem>
                    <SelectItem value="سنوي">سنوي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Alert className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30">
              <Calculator className="h-4 w-4 text-primary" />
              <AlertTitle className="text-primary font-semibold">حاسبة العقد الذكية</AlertTitle>
              <AlertDescription className="space-y-3">
                <p className="text-sm">أدخل المدة والمبلغ الإجمالي وسيتم حساب التفاصيل تلقائياً</p>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">المدة</Label>
                    <Input
                      type="number"
                      min="1"
                      value={contractDuration}
                      onChange={(e) => setContractDuration(parseInt(e.target.value) || 1)}
                      className="bg-background"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs">الوحدة</Label>
                    <Select value={durationUnit} onValueChange={(v: 'سنوات' | 'أشهر') => setDurationUnit(v)}>
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="سنوات">سنوات</SelectItem>
                        <SelectItem value="أشهر">أشهر</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">المبلغ الإجمالي</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={totalAmount}
                      onChange={(e) => setTotalAmount(e.target.value)}
                      placeholder="0.00"
                      className="bg-background"
                    />
                  </div>
                </div>

                {formData.monthly_rent && (
                  <div className="flex items-center gap-2 pt-2 border-t border-primary/20">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">
                      الإيجار الشهري: {parseFloat(formData.monthly_rent).toLocaleString('ar-SA')} ريال
                    </span>
                  </div>
                )}
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>تاريخ بداية العقد *</Label>
                <div className="relative">
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>تاريخ نهاية العقد *</Label>
                <div className="relative">
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                  />
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>الإيجار الشهري *</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.monthly_rent}
                    onChange={(e) => setFormData({ ...formData, monthly_rent: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                  <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>مبلغ التأمين</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.security_deposit}
                    onChange={(e) => setFormData({ ...formData, security_deposit: e.target.value })}
                    placeholder="0.00"
                  />
                  <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            {!contract && selectedPropertyId && (
              <div className="space-y-3 border border-border rounded-lg p-4">
                <Label className="text-base font-semibold">الوحدات المتاحة للتأجير *</Label>
                {unitsLoading ? (
                  <p className="text-sm text-muted-foreground">جاري تحميل الوحدات...</p>
                ) : availableUnits.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>لا توجد وحدات متاحة في هذا العقار</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                    {availableUnits.map((unit) => (
                      <div
                        key={unit.id}
                        className={`flex items-start space-x-2 space-x-reverse p-3 rounded-lg border transition-colors cursor-pointer ${
                          selectedUnits.includes(unit.id)
                            ? 'bg-primary/10 border-primary'
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => toggleUnit(unit.id)}
                      >
                        <Checkbox
                          checked={selectedUnits.includes(unit.id)}
                          onCheckedChange={() => toggleUnit(unit.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{unit.unit_number}</div>
                          <div className="text-xs text-muted-foreground">{unit.unit_type}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {selectedUnits.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-primary pt-2 border-t">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>تم اختيار {selectedUnits.length} وحدة</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center space-x-2 space-x-reverse p-4 bg-muted/30 rounded-lg">
              <Switch
                id="renewable"
                checked={formData.is_renewable}
                onCheckedChange={(checked) => setFormData({ ...formData, is_renewable: checked })}
              />
              <Label htmlFor="renewable" className="cursor-pointer">
                عقد قابل للتجديد
              </Label>
            </div>

            {formData.is_renewable && (
              <div className="grid grid-cols-2 gap-4 pl-8 pr-4">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch
                    id="auto-renew"
                    checked={formData.auto_renew}
                    onCheckedChange={(checked) => setFormData({ ...formData, auto_renew: checked })}
                  />
                  <Label htmlFor="auto-renew" className="cursor-pointer text-sm">
                    تجديد تلقائي
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">مدة الإشعار (بالأيام)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.renewal_notice_days}
                    onChange={(e) => setFormData({ ...formData, renewal_notice_days: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>الشروط والأحكام</Label>
              <Textarea
                value={formData.terms_and_conditions}
                onChange={(e) => setFormData({ ...formData, terms_and_conditions: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>ملاحظات</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                إلغاء
              </Button>
              <Button type="submit">
                {contract ? "تحديث" : "إضافة"}
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </ResponsiveDialog>
  );
};
