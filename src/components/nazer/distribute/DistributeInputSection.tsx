/**
 * DistributeInputSection
 * قسم إدخال بيانات توزيع الغلة
 */

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ActiveFiscalYear } from "@/hooks/fiscal-years";

interface DistributeInputSectionProps {
  totalAmount: string;
  setTotalAmount: (value: string) => void;
  selectedFiscalYear: string;
  setSelectedFiscalYear: (value: string) => void;
  distributionDate: string;
  setDistributionDate: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
  notifyHeirs: boolean;
  setNotifyHeirs: (value: boolean) => void;
  activeFiscalYears: ActiveFiscalYear[];
}

export function DistributeInputSection({
  totalAmount,
  setTotalAmount,
  selectedFiscalYear,
  setSelectedFiscalYear,
  distributionDate,
  setDistributionDate,
  notes,
  setNotes,
  notifyHeirs,
  setNotifyHeirs,
  activeFiscalYears,
}: DistributeInputSectionProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="amount">المبلغ الإجمالي للتوزيع (ر.س)</Label>
        <Input
          id="amount"
          type="number"
          placeholder="1,000,000"
          value={totalAmount}
          onChange={(e) => setTotalAmount(e.target.value)}
          className="text-lg"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fiscalYear">السنة المالية</Label>
        <Select
          value={selectedFiscalYear}
          onValueChange={setSelectedFiscalYear}
        >
          <SelectTrigger>
            <SelectValue placeholder="اختر السنة المالية" />
          </SelectTrigger>
          <SelectContent>
            {activeFiscalYears.map((fy) => (
              <SelectItem key={fy.id} value={fy.id}>
                {fy.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">تاريخ التوزيع</Label>
        <Input
          id="date"
          type="date"
          value={distributionDate}
          onChange={(e) => setDistributionDate(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">ملاحظات</Label>
        <Textarea
          id="notes"
          placeholder="ملاحظات إضافية..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />
      </div>

      <div className="flex items-center justify-between md:col-span-2">
        <div className="space-y-0.5">
          <Label>إرسال إشعارات للورثة</Label>
          <p className="text-sm text-muted-foreground">
            إشعار الورثة بإيداع حصصهم
          </p>
        </div>
        <Switch checked={notifyHeirs} onCheckedChange={setNotifyHeirs} />
      </div>
    </div>
  );
}
