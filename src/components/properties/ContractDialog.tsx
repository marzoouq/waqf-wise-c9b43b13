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

  // دالة حساب تلقائية للتفاصيل - محسّنة لمنع الحلقات
  const calculateContractDetails = useCallback(() => {
    if (!formData.start_date || !totalAmount || !contractDuration) return;
    
    const startDate = new Date(formData.start_date);
    const durationInMonths = durationUnit === 'سنوات' ? contractDuration * 12 : contractDuration;
    
    // حساب تاريخ النهاية تلقائياً
    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + durationInMonths);
    const calculatedEndDate = endDate.toISOString().split('T')[0];
    
    // حساب الإيجار الشهري تلقائياً
    const monthlyRent = parseFloat(totalAmount) / durationInMonths;
    const calculatedMonthlyRent = monthlyRent.toFixed(2);
    
    // تحديث فقط إذا كانت القيم مختلفة
    setFormData(prev => {
      if (prev.end_date === calculatedEndDate && prev.monthly_rent === calculatedMonthlyRent) {
        return prev; // لا تحديث إذا كانت القيم مماثلة
      }
      return {
        ...prev,
        end_date: calculatedEndDate,
        monthly_rent: calculatedMonthlyRent,
      };
    });
  }, [formData.start_date, totalAmount, contractDuration, durationUnit]);

  // تشغيل الحساب عند تغيير أي حقل (مرة واحدة فقط عند التغيير الفعلي)
  useEffect(() => {
    if (!contract && formData.start_date && totalAmount && contractDuration) {
      calculateContractDetails();
    }
  }, [contract, formData.start_date, totalAmount, contractDuration, durationUnit, calculateContractDetails]);

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
      
      // حساب المدة والمبلغ الإجمالي من العقد الموجود
      const start = new Date(contract.start_date);
      const end = new Date(contract.end_date);
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      const years = Math.floor(months / 12);
      
      if (years > 0 && months % 12 === 0) {
        setContractDuration(years);
        setDurationUnit('سنوات');
      } else {
        setContractDuration(months);
        setDurationUnit('أشهر');
      }
      
      setTotalAmount((contract.monthly_rent * months).toString());
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

    // التحقق من الوحدات
    if (!contract && selectedUnits.length === 0) {
      toast({
        title: "خطأ",
        description: "يجب اختيار وحدة واحدة على الأقل",
        variant: "destructive",
      });
      return;
    }

    // التحقق من المدة
    if (!contract && contractDuration < 1) {
      toast({
        title: "خطأ",
        description: "مدة العقد يجب أن تكون أكبر من صفر",
        variant: "destructive",
      });
      return;
    }

    // التحقق من المبلغ
    if (!contract && (parseFloat(totalAmount) <= 0 || !totalAmount)) {
      toast({
        title: "خطأ",
        description: "المبلغ الإجمالي يجب أن يكون أكبر من صفر",
        variant: "destructive",
      });
      return;
    }

    // التحقق من التواريخ
    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);
    if (endDate <= startDate) {
      toast({
        title: "خطأ",
        description: "تاريخ النهاية يجب أن يكون بعد تاريخ البداية",
        variant: "destructive",
      });
      return;
    }

    // التحقق من الإيجار الشهري
    const monthlyRent = parseFloat(formData.monthly_rent);
    if (monthlyRent <= 0 || isNaN(monthlyRent)) {
      toast({
        title: "خطأ",
        description: "الإيجار الشهري غير صحيح",
        variant: "destructive",
      });
      return;
    }

    const contractData = {
      ...formData,
      monthly_rent: monthlyRent,
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

          {/* قسم الحسابات الذكية */}
          <div className="space-y-4 bg-primary/5 border border-primary/20 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              معلومات العقد الأساسية
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* تاريخ البداية */}
              <div className="space-y-2">
                <Label>تاريخ بداية العقد *</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>
              
              {/* مدة العقد */}
              <div className="space-y-2">
                <Label>مدة العقد *</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="1"
                    value={contractDuration}
                    onChange={(e) => setContractDuration(parseInt(e.target.value) || 1)}
                    className="flex-1"
                    placeholder="3"
                    required
                    disabled={!!contract}
                  />
                  <Select 
                    value={durationUnit} 
                    onValueChange={(value: 'سنوات' | 'أشهر') => setDurationUnit(value)}
                    disabled={!!contract}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="سنوات">سنوات</SelectItem>
                      <SelectItem value="أشهر">أشهر</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground">
                  مثال: 3 سنوات أو 18 شهر
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* المبلغ الإجمالي */}
              <div className="space-y-2">
                <Label>المبلغ الإجمالي للعقد (ر.س) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  placeholder="360000"
                  required
                  disabled={!!contract}
                />
                <p className="text-xs text-muted-foreground">
                  💡 إجمالي المبلغ لكامل مدة العقد
                </p>
              </div>
              
              {/* نوع الدفع */}
              <div className="space-y-2">
                <Label>نوع الدفع *</Label>
                <Select
                  value={formData.payment_frequency}
                  onValueChange={(value) => setFormData({ ...formData, payment_frequency: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="شهري">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>دفعات شهرية</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="سنوي">
                      <div className="flex items-center gap-2">
                        <Banknote className="h-4 w-4" />
                        <span>دفعة سنوية مقدماً</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  💡 شهري = دفعات متعددة، سنوي = دفعة واحدة
                </p>
              </div>
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
                placeholder="10000"
              />
            </div>
            
            {/* الحسابات التلقائية - للعرض فقط */}
            {!contract && formData.end_date && formData.monthly_rent && (
              <div className="bg-success/10 border border-success/30 rounded-lg p-3 space-y-2">
                <p className="text-xs font-semibold text-success-foreground flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  الحسابات التلقائية:
                </p>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">تاريخ النهاية:</span>
                    <p className="font-semibold text-success-foreground">
                      {formData.end_date}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">الإيجار الشهري:</span>
                    <p className="font-semibold text-success-foreground">
                      {parseFloat(formData.monthly_rent).toLocaleString('ar-SA')} ر.س
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">عدد الدفعات:</span>
                    <p className="font-semibold text-success-foreground">
                      {formData.payment_frequency === 'شهري' 
                        ? `${contractDuration * (durationUnit === 'سنوات' ? 12 : 1)} دفعة`
                        : '1 دفعة'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {!contract && (
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