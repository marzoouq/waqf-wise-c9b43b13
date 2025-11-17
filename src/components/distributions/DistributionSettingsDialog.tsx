import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings } from "lucide-react";
import { useDistributionSettings } from "@/hooks/useDistributionSettings";

export function DistributionSettingsDialog() {
  const { settings, updateSettings } = useDistributionSettings();
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    distribution_frequency: settings?.distribution_frequency || "شهري",
    distribution_rule: settings?.distribution_rule || "شرعي",
    nazer_percentage: settings?.nazer_percentage || 10,
    waqif_charity_percentage: settings?.waqif_charity_percentage || 5,
    waqf_corpus_percentage: settings?.waqf_corpus_percentage || 0,
    wives_share_ratio: settings?.wives_share_ratio || 12.5,
    auto_distribution: settings?.auto_distribution || false,
    distribution_day_of_month: settings?.distribution_day_of_month || 1,
    notify_beneficiaries: settings?.notify_beneficiaries || true,
    notify_nazer: settings?.notify_nazer || true,
  });

  const handleSubmit = async () => {
    await updateSettings({
      ...formData,
      is_active: true as true,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Settings className="h-4 w-4" />
          إعدادات التوزيع
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>إعدادات التوزيع</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* تكرار التوزيع */}
          <div className="space-y-2">
            <Label>تكرار التوزيع</Label>
            <Select
              value={formData.distribution_frequency}
              onValueChange={(value: any) => setFormData({ ...formData, distribution_frequency: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="شهري">شهري</SelectItem>
                <SelectItem value="ربع_سنوي">ربع سنوي</SelectItem>
                <SelectItem value="نصف_سنوي">نصف سنوي</SelectItem>
                <SelectItem value="سنوي">سنوي</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* قاعدة التوزيع */}
          <div className="space-y-2">
            <Label>قاعدة التوزيع</Label>
            <Select
              value={formData.distribution_rule}
              onValueChange={(value: any) => setFormData({ ...formData, distribution_rule: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="شرعي">شرعي (للذكر مثل حظ الأنثيين)</SelectItem>
                <SelectItem value="متساوي">متساوي</SelectItem>
                <SelectItem value="مخصص">مخصص</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* نسبة الناظر */}
          <div className="space-y-2">
            <Label>نسبة الناظر (%)</Label>
            <Input
              type="number"
              step="0.1"
              value={formData.nazer_percentage}
              onChange={(e) => setFormData({ ...formData, nazer_percentage: parseFloat(e.target.value) })}
            />
          </div>

          {/* نسبة صدقة الواقف */}
          <div className="space-y-2">
            <Label>نسبة صدقة الواقف (%)</Label>
            <Input
              type="number"
              step="0.1"
              value={formData.waqif_charity_percentage}
              onChange={(e) => setFormData({ ...formData, waqif_charity_percentage: parseFloat(e.target.value) })}
            />
          </div>

          {/* نسبة رقبة الوقف */}
          <div className="space-y-2">
            <Label>نسبة رقبة الوقف (%)</Label>
            <Input
              type="number"
              step="0.1"
              value={formData.waqf_corpus_percentage}
              onChange={(e) => setFormData({ ...formData, waqf_corpus_percentage: parseFloat(e.target.value) })}
            />
          </div>

          {/* نسبة الزوجات */}
          <div className="space-y-2">
            <Label>نسبة الزوجات (الثمن) (%)</Label>
            <Input
              type="number"
              step="0.1"
              value={formData.wives_share_ratio}
              onChange={(e) => setFormData({ ...formData, wives_share_ratio: parseFloat(e.target.value) })}
            />
          </div>

          {/* يوم التوزيع */}
          <div className="space-y-2">
            <Label>يوم التوزيع من الشهر</Label>
            <Input
              type="number"
              min="1"
              max="31"
              value={formData.distribution_day_of_month}
              onChange={(e) => setFormData({ ...formData, distribution_day_of_month: parseInt(e.target.value) })}
            />
          </div>

          {/* التوزيع التلقائي */}
          <div className="flex items-center justify-between">
            <Label>تفعيل التوزيع التلقائي</Label>
            <Switch
              checked={formData.auto_distribution}
              onCheckedChange={(checked) => setFormData({ ...formData, auto_distribution: checked })}
            />
          </div>

          {/* إشعارات المستفيدين */}
          <div className="flex items-center justify-between">
            <Label>إشعار المستفيدين</Label>
            <Switch
              checked={formData.notify_beneficiaries}
              onCheckedChange={(checked) => setFormData({ ...formData, notify_beneficiaries: checked as true })}
            />
          </div>

          {/* إشعار الناظر */}
          <div className="flex items-center justify-between">
            <Label>إشعار الناظر</Label>
            <Switch
              checked={formData.notify_nazer}
              onCheckedChange={(checked) => setFormData({ ...formData, notify_nazer: checked as true })}
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end mt-6">
          <Button variant="outline" onClick={() => setOpen(false)}>
            إلغاء
          </Button>
          <Button onClick={handleSubmit}>
            حفظ الإعدادات
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
