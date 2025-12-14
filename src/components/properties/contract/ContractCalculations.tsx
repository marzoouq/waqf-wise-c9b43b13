import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Calendar, Banknote, CheckCircle2 } from "lucide-react";
import { ContractFormData } from "./useContractForm";

interface Props {
  formData: ContractFormData;
  onUpdate: (updates: Partial<ContractFormData>) => void;
  contractDuration: number;
  setContractDuration: (duration: number) => void;
  durationUnit: 'سنوات' | 'أشهر';
  setDurationUnit: (unit: 'سنوات' | 'أشهر') => void;
  totalAmount: string;
  setTotalAmount: (amount: string) => void;
  isEditing: boolean;
}

export function ContractCalculations({
  formData,
  onUpdate,
  contractDuration,
  setContractDuration,
  durationUnit,
  setDurationUnit,
  totalAmount,
  setTotalAmount,
  isEditing,
}: Props) {
  return (
    <div className="space-y-4 bg-primary/5 border border-primary/20 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
        <Calculator className="h-4 w-4" />
        معلومات العقد الأساسية
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>تاريخ بداية العقد *</Label>
          <Input
            type="date"
            value={formData.start_date}
            onChange={(e) => onUpdate({ start_date: e.target.value })}
            required
          />
        </div>
        
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
              disabled={isEditing}
            />
            <Select 
              value={durationUnit} 
              onValueChange={(value: 'سنوات' | 'أشهر') => setDurationUnit(value)}
              disabled={isEditing}
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
        <div className="space-y-2">
          <Label>المبلغ الإجمالي للعقد (ر.س) *</Label>
          <Input
            type="number"
            step="0.01"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            placeholder="360000"
            required
            disabled={isEditing}
          />
          <p className="text-xs text-muted-foreground">
            💡 إجمالي المبلغ لكامل مدة العقد
          </p>
        </div>
        
        <div className="space-y-2">
          <Label>نوع الدفع *</Label>
          <Select
            value={formData.payment_frequency}
            onValueChange={(value) => onUpdate({ payment_frequency: value })}
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
          <span className="text-xs text-muted-foreground me-2">
            (مبلغ يُدفع مرة واحدة عند توقيع العقد)
          </span>
        </Label>
        <Input
          type="number"
          step="0.01"
          value={formData.security_deposit}
          onChange={(e) => onUpdate({ security_deposit: e.target.value })}
          placeholder="10000"
        />
      </div>
      
      {/* الحسابات التلقائية */}
      {!isEditing && formData.end_date && formData.monthly_rent && (
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
  );
}
