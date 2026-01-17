/**
 * Dialog لإنشاء تقرير مخصص جديد
 */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

interface CreateReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    name: string;
    report_type: string;
    fields: string[];
    is_public?: boolean;
  }) => Promise<void>;
  reportFields: Record<string, string[]>;
}

const REPORT_TYPE_LABELS: Record<string, string> = {
  beneficiaries: "المستفيدون",
  properties: "العقارات",
  distributions: "التوزيعات",
};

const FIELD_LABELS: Record<string, Record<string, string>> = {
  beneficiaries: {
    full_name: "الاسم الكامل",
    national_id: "رقم الهوية",
    phone: "الهاتف",
    email: "البريد الإلكتروني",
    status: "الحالة",
    category: "الفئة",
    total_received: "إجمالي المستلم",
    account_balance: "رصيد الحساب",
    created_at: "تاريخ التسجيل",
  },
  properties: {
    name: "اسم العقار",
    location: "الموقع",
    property_type: "نوع العقار",
    status: "الحالة",
    monthly_rent: "الإيجار الشهري",
    total_units: "عدد الوحدات",
    occupied_units: "الوحدات المؤجرة",
    created_at: "تاريخ الإضافة",
  },
  distributions: {
    distribution_date: "تاريخ التوزيع",
    total_amount: "المبلغ الإجمالي",
    status: "الحالة",
    distribution_month: "شهر التوزيع",
    beneficiaries_count: "عدد المستفيدين",
    created_at: "تاريخ الإنشاء",
  },
};

export function CreateReportDialog({
  open,
  onOpenChange,
  onSubmit,
  reportFields,
}: CreateReportDialogProps) {
  const [name, setName] = useState("");
  const [reportType, setReportType] = useState<string>("");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const availableFields = reportType ? reportFields[reportType] || [] : [];

  const handleFieldToggle = (field: string) => {
    setSelectedFields((prev) =>
      prev.includes(field)
        ? prev.filter((f) => f !== field)
        : [...prev, field]
    );
  };

  const handleSelectAll = () => {
    if (selectedFields.length === availableFields.length) {
      setSelectedFields([]);
    } else {
      setSelectedFields([...availableFields]);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !reportType || selectedFields.length === 0) return;

    setIsLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        report_type: reportType,
        fields: selectedFields,
        is_public: isPublic,
      });
      // Reset form
      setName("");
      setReportType("");
      setSelectedFields([]);
      setIsPublic(false);
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypeChange = (type: string) => {
    setReportType(type);
    setSelectedFields([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>إنشاء تقرير مخصص جديد</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="report-name">اسم التقرير</Label>
            <Input
              id="report-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="أدخل اسم التقرير"
            />
          </div>

          <div className="space-y-2">
            <Label>نوع التقرير</Label>
            <Select value={reportType} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع التقرير" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(REPORT_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {reportType && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>الحقول المطلوبة</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  type="button"
                >
                  {selectedFields.length === availableFields.length
                    ? "إلغاء الكل"
                    : "تحديد الكل"}
                </Button>
              </div>
              <ScrollArea className="h-48 rounded-md border p-3">
                <div className="space-y-2">
                  {availableFields.map((field) => (
                    <div key={field} className="flex items-center gap-2">
                      <Checkbox
                        id={field}
                        checked={selectedFields.includes(field)}
                        onCheckedChange={() => handleFieldToggle(field)}
                      />
                      <Label htmlFor={field} className="font-normal cursor-pointer">
                        {FIELD_LABELS[reportType]?.[field] || field}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Checkbox
              id="is-public"
              checked={isPublic}
              onCheckedChange={(checked) => setIsPublic(!!checked)}
            />
            <Label htmlFor="is-public" className="font-normal cursor-pointer">
              تقرير عام (متاح للجميع)
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !name.trim() || !reportType || selectedFields.length === 0 || isLoading
            }
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin me-2" />
                جاري الحفظ...
              </>
            ) : (
              "إنشاء التقرير"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
