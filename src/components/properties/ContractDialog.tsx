import { useState, useEffect } from "react";
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
import { ContractWithUnitsCount } from "@/types/contracts";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract?: Contract | null;
}

export const ContractDialog = ({ open, onOpenChange, contract }: Props) => {
  const { addContract, updateContract } = useContracts();
  const { properties } = useProperties();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const { units, isLoading: unitsLoading } = usePropertyUnits(selectedPropertyId);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);

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
      // Generate contract number for new contracts
      const date = new Date();
      const contractNumber = `C-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${Date.now().toString().slice(-4)}`;
      setFormData(prev => ({ ...prev, contract_number: contractNumber }));
    }
  }, [contract]);

  // ملء تلقائي للإيجار عند اختيار العقار
  useEffect(() => {
    if (formData.property_id && !contract && properties) {
      const selectedProperty = properties.find(p => p.id === formData.property_id);
      if (selectedProperty) {
        setFormData(prev => ({
          ...prev,
          monthly_rent: selectedProperty.monthly_revenue?.toString() || prev.monthly_rent,
        }));
        setSelectedPropertyId(selectedProperty.id);
        setSelectedUnits([]); // إعادة تعيين الوحدات المختارة
      }
    }
  }, [formData.property_id, properties, contract]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!contract && selectedUnits.length === 0) {
      toast({
        title: "خطأ",
        description: "يجب اختيار وحدة واحدة على الأقل",
        variant: "destructive",
      });
      return;
    }

    const contractData = {
      ...formData,
      monthly_rent: parseFloat(formData.monthly_rent),
      security_deposit: parseFloat(formData.security_deposit) || 0,
      renewal_notice_days: parseInt(formData.renewal_notice_days),
      units_count: selectedUnits.length,
      unit_ids: selectedUnits,
    };

    if (contract) {
      updateContract.mutate({ id: contract.id, ...contractData });
    } else {
      addContract.mutate(contractData);
    }
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    const date = new Date();
    const contractNumber = `C-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${Date.now().toString().slice(-4)}`;
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
  };

  const availableUnits = units?.filter(u => u.status === 'available') || [];
  
  const toggleUnit = (unitId: string) => {
    setSelectedUnits(prev => 
      prev.includes(unitId) 
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    );
  };

  return (
    <ResponsiveDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title={contract ? "تعديل عقد" : "إضافة عقد جديد"}
      description={contract ? "تعديل بيانات العقد" : "أدخل بيانات العقد الجديد"}
      size="xl"
    >
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
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر العقار" />
                </SelectTrigger>
                <SelectContent>
                  {properties?.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>نوع العقد *</Label>
              <Select
                value={formData.contract_type}
                onValueChange={(value) => setFormData({ ...formData, contract_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="إيجار">إيجار</SelectItem>
                  <SelectItem value="بيع">بيع</SelectItem>
                  <SelectItem value="صيانة">صيانة</SelectItem>
                  <SelectItem value="خدمات">خدمات</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>اسم المستأجر *</Label>
              <Input
                value={formData.tenant_name}
                onChange={(e) => setFormData({ ...formData, tenant_name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>رقم الهوية *</Label>
              <Input
                value={formData.tenant_id_number}
                onChange={(e) => setFormData({ ...formData, tenant_id_number: e.target.value })}
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
                required
              />
            </div>

            <div className="space-y-2">
              <Label>البريد الإلكتروني</Label>
              <Input
                type="email"
                value={formData.tenant_email}
                onChange={(e) => setFormData({ ...formData, tenant_email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>تاريخ البداية *</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>تاريخ النهاية *</Label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>الإيجار الشهري *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.monthly_rent}
                onChange={(e) => setFormData({ ...formData, monthly_rent: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>
                التأمين (ريال) - اختياري
                <span className="text-xs text-muted-foreground mr-2">
                  (مبلغ يُدفع مرة واحدة عند توقيع العقد)
                </span>
              </Label>
              <Input
                type="number"
                step="0.01"
                value={formData.security_deposit}
                onChange={(e) => setFormData({ ...formData, security_deposit: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>تكرار الدفع</Label>
              <Select
                value={formData.payment_frequency}
                onValueChange={(value) => setFormData({ ...formData, payment_frequency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              <SelectContent>
                <SelectItem value="شهري">شهري</SelectItem>
                <SelectItem value="ربع سنوي">ربع سنوي</SelectItem>
                <SelectItem value="نصف سنوي">نصف سنوي</SelectItem>
                <SelectItem value="سنوي">سنوي</SelectItem>
                <SelectItem value="دفعة واحدة">دفعة واحدة (مقدماً)</SelectItem>
                <SelectItem value="دفعتين">دفعتين</SelectItem>
              </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                💡 اختر "دفعة واحدة" للعقود السنوية المدفوعة مقدماً
              </p>
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
                          : 'hover:bg-muted border-border'
                      }`}
                      onClick={() => toggleUnit(unit.id)}
                    >
                      <Checkbox
                        checked={selectedUnits.includes(unit.id)}
                        onCheckedChange={() => toggleUnit(unit.id)}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{unit.unit_name}</p>
                        <p className="text-xs text-muted-foreground">{unit.unit_number}</p>
                        <div className="flex gap-1 mt-1">
                          <Badge variant="outline" className="text-xs">{unit.unit_type}</Badge>
                          {unit.floor_number && <Badge variant="secondary" className="text-xs">طابق {unit.floor_number}</Badge>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {selectedUnits.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  تم اختيار {selectedUnits.length} وحدة
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Switch
                checked={formData.is_renewable}
                onCheckedChange={(checked) => setFormData({ ...formData, is_renewable: checked })}
              />
              <Label>قابل للتجديد</Label>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse">
              <Switch
                checked={formData.auto_renew}
                onCheckedChange={(checked) => setFormData({ ...formData, auto_renew: checked })}
              />
              <Label>تجديد تلقائي</Label>
            </div>

            <div className="space-y-2">
              <Label>أيام التنبيه</Label>
              <Input
                type="number"
                value={formData.renewal_notice_days}
                onChange={(e) => setFormData({ ...formData, renewal_notice_days: e.target.value })}
              />
            </div>
          </div>

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
    </ResponsiveDialog>
  );
};