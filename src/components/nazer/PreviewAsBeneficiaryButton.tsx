/**
 * زر معاينة كـ مستفيد
 * يسمح للناظر بعرض لوحة المستفيد كما يراها المستفيد
 * 
 * ميزة Impersonation/View As - معتمدة في المنصات الكبيرة:
 * - Shopify/Stripe: دعم فني يرى ما يراه العميل
 * - Canvas/Blackboard: المعلم يرى ما يراه الطالب
 * - SAP/Oracle: المشرف يرى ما يراه الموظف
 * 
 * @version 2.8.78
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Eye, ExternalLink, User, AlertCircle } from "lucide-react";
import { useNazerBeneficiariesQuick } from "@/hooks/nazer/useNazerBeneficiariesQuick";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { matchesStatus } from "@/lib/constants";

export function PreviewAsBeneficiaryButton() {
  const [open, setOpen] = useState(false);
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState<string>("");
  const { data: beneficiaries = [], isLoading } = useNazerBeneficiariesQuick();

  const handlePreview = () => {
    if (!selectedBeneficiaryId) return;
    
    // فتح لوحة المستفيد في نافذة جديدة مع وضع المعاينة
    const previewUrl = `/beneficiary-portal?preview=true&beneficiary_id=${selectedBeneficiaryId}`;
    window.open(previewUrl, '_blank', 'noopener,noreferrer');
    setOpen(false);
  };

  const selectedBeneficiary = beneficiaries.find(b => b.id === selectedBeneficiaryId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Eye className="h-4 w-4" />
          <span className="hidden sm:inline">معاينة كـ مستفيد</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            معاينة لوحة المستفيد
          </DialogTitle>
          <DialogDescription>
            اختر مستفيد لعرض لوحته كما يراها بالضبط
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert className="bg-muted/50 border-muted">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              ستفتح لوحة المستفيد في نافذة جديدة بوضع القراءة فقط.
              هذه الميزة للمعاينة والتحقق من إعدادات الظهور.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <label className="text-sm font-medium">اختر المستفيد</label>
            <Select
              value={selectedBeneficiaryId}
              onValueChange={setSelectedBeneficiaryId}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? "جاري التحميل..." : "اختر مستفيد..."} />
              </SelectTrigger>
              <SelectContent>
                {beneficiaries.map((beneficiary) => (
                  <SelectItem key={beneficiary.id} value={beneficiary.id}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{beneficiary.full_name}</span>
                      <Badge variant="outline" className="text-xs">
                        {beneficiary.category}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedBeneficiary && (
            <div className="p-3 rounded-lg bg-muted/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">المستفيد المحدد:</span>
                <span className="font-medium">{selectedBeneficiary.full_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">الحالة:</span>
                <Badge 
                  className={
                    matchesStatus(selectedBeneficiary.status, 'active')
                      ? "bg-status-success/10 text-status-success" 
                      : "bg-status-warning/10 text-status-warning"
                  }
                >
                  {selectedBeneficiary.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">الفئة:</span>
                <span className="text-sm">{selectedBeneficiary.category}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            إلغاء
          </Button>
          <Button 
            onClick={handlePreview} 
            disabled={!selectedBeneficiaryId}
            className="gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            فتح المعاينة
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
