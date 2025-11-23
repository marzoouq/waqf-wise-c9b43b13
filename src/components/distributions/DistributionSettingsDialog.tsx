import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Settings, Info } from "lucide-react";
import { useDistributionSettings } from "@/hooks/useDistributionSettings";

export function DistributionSettingsDialog() {
  const { settings, updateSettings } = useDistributionSettings();
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    distribution_frequency: settings?.distribution_frequency || "شهري",
    distribution_rule: settings?.distribution_rule || "شرعي",
    maintenance_percentage: settings?.maintenance_percentage || 5,
    nazer_percentage: settings?.nazer_percentage || 10,
    waqif_charity_percentage: settings?.waqif_charity_percentage || 5,
    waqf_corpus_percentage: settings?.waqf_corpus_percentage || 0,
    reserve_percentage: settings?.reserve_percentage || 0,
    wives_share_ratio: settings?.wives_share_ratio || 12.5,
    auto_distribution: settings?.auto_distribution || false,
    distribution_day_of_month: settings?.distribution_day_of_month || 1,
    notify_beneficiaries: settings?.notify_beneficiaries || true,
    notify_nazer: settings?.notify_nazer || true,
  });

  const handleSubmit = async () => {
    await updateSettings({
      ...formData,
      calculation_order: 'تسلسلي',
      is_active: true as true,
    });
    setOpen(false);
  };

  const totalPercentages = 
    formData.maintenance_percentage +
    formData.nazer_percentage +
    formData.waqif_charity_percentage +
    formData.reserve_percentage;

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
          <DialogDescription>
            إدارة نسب الاستقطاع وقواعد التوزيع الافتراضية (حساب تسلسلي شرعي)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* تكرار التوزيع */}
          <div className="space-y-2">
            <Label>تكرار التوزيع</Label>
            <Select
              value={formData.distribution_frequency}
              onValueChange={(value) => setFormData({ ...formData, distribution_frequency: value as typeof formData.distribution_frequency })}
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

          {/* Sharia Compliant Order Alert */}
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 text-sm">
              <strong>الترتيب الشرعي للاستقطاعات:</strong>
              <ol className="list-decimal mr-6 mt-2 space-y-1 text-xs">
                <li>الصيانة والعمارة (حفظ أصل الوقف) - أولوية</li>
                <li>نسبة الناظر (من الباقي)</li>
                <li>صدقة الواقف (من الباقي)</li>
                <li>المستفيدون (الباقي)</li>
              </ol>
            </AlertDescription>
          </Alert>

          {/* Maintenance Percentage - Priority 1 */}
          <div className="rounded-lg border-2 border-green-300 bg-green-50 p-4 space-y-2">
            <Label className="text-green-800 font-bold flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-600 text-white">1</Badge>
              نسبة الصيانة والعمارة
            </Label>
            <Input
              type="number"
              step="0.5"
              value={formData.maintenance_percentage}
              onChange={(e) => setFormData({ ...formData, maintenance_percentage: parseFloat(e.target.value) })}
              min="0"
              max="20"
            />
            <p className="text-xs text-green-700">
              أول ما يُخرج من الغلة لحفظ عين الوقف
            </p>
          </div>

          {/* Nazer Percentage - Priority 2 */}
          <div className="rounded-lg border-2 border-blue-300 bg-blue-50 p-4 space-y-2">
            <Label className="text-blue-800 font-bold flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-600 text-white">2</Badge>
              نسبة الناظر
            </Label>
            <Input
              type="number"
              step="0.1"
              value={formData.nazer_percentage}
              onChange={(e) => setFormData({ ...formData, nazer_percentage: parseFloat(e.target.value) })}
              min="0"
              max="15"
            />
            <p className="text-xs text-blue-700">
              تُحسب من الباقي بعد الصيانة
            </p>
          </div>

          {/* Waqif Charity Percentage - Priority 3 */}
          <div className="rounded-lg border-2 border-accent/30 bg-accent/10 p-4 space-y-2">
            <Label className="text-accent font-bold flex items-center gap-2">
              <Badge variant="secondary" className="bg-accent text-accent-foreground">3</Badge>
              صدقة الواقف
            </Label>
            <Input
              type="number"
              step="0.1"
              value={formData.waqif_charity_percentage}
              onChange={(e) => setFormData({ ...formData, waqif_charity_percentage: parseFloat(e.target.value) })}
              min="0"
              max="10"
            />
            <p className="text-xs text-accent">
              تُحسب من الباقي بعد الناظر
            </p>
          </div>

          {/* Reserve Percentage - Optional */}
          <div className="rounded-lg border border-gray-300 bg-gray-50 p-4 space-y-2">
            <Label className="text-gray-700 flex items-center gap-2">
              <Info className="h-4 w-4" />
              احتياطي إضافي (اختياري)
            </Label>
            <Input
              type="number"
              step="0.5"
              value={formData.reserve_percentage}
              onChange={(e) => setFormData({ ...formData, reserve_percentage: parseFloat(e.target.value) })}
              min="0"
              max="10"
            />
            <p className="text-xs text-gray-600">
              للطوارئ والمشاريع المستقبلية، يُحسب من الباقي
            </p>
          </div>

          {/* Total Percentages Warning */}
          {totalPercentages > 50 && (
            <Alert variant="destructive">
              <AlertDescription>
                مجموع النسب ({totalPercentages}%) مرتفع جداً! يجب ألا يتجاوز 50%
              </AlertDescription>
            </Alert>
          )}

          {/* قاعدة التوزيع */}
          <div className="space-y-2">
            <Label>قاعدة التوزيع</Label>
            <Select
              value={formData.distribution_rule}
              onValueChange={(value) => setFormData({ ...formData, distribution_rule: value as typeof formData.distribution_rule })}
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
          <Button onClick={handleSubmit} disabled={totalPercentages > 50}>
            حفظ الإعدادات
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}