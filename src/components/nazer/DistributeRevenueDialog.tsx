import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Users, Coins, AlertCircle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useFiscalYearsList, FISCAL_YEARS_QUERY_KEY } from "@/hooks/fiscal-years";

interface DistributeRevenueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface HeirShare {
  beneficiary_id: string;
  heir_type: string;
  share_amount: number;
  share_percentage: number;
  beneficiary_name?: string;
}

export function DistributeRevenueDialog({
  open,
  onOpenChange,
}: DistributeRevenueDialogProps) {
  const queryClient = useQueryClient();
  const [totalAmount, setTotalAmount] = useState<string>("");
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<string>("");
  const [distributionDate, setDistributionDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [notes, setNotes] = useState<string>("");
  const [notifyHeirs, setNotifyHeirs] = useState(true);
  const [previewShares, setPreviewShares] = useState<HeirShare[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // استخدام الـ hook الموحد للسنوات المالية
  const { fiscalYears } = useFiscalYearsList();
  const activeFiscalYears = fiscalYears.filter(fy => fy.is_active);

  // Fetch beneficiaries for preview
  const { data: beneficiaries = [] } = useQuery({
    queryKey: ["beneficiaries-active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("beneficiaries")
        .select("id, full_name, relationship")
        .eq("status", "نشط")
        .in("relationship", ["زوجة", "ابن", "بنت"]);
      if (error) throw error;
      return data || [];
    },
  });

  // Calculate preview
  const calculatePreview = async () => {
    const amount = parseFloat(totalAmount);
    if (!amount || amount <= 0) {
      toast.error("يرجى إدخال مبلغ صحيح");
      return;
    }

    try {
      const { data, error } = await supabase.rpc("calculate_shariah_distribution", {
        p_total_amount: amount,
      });

      if (error) throw error;

      const sharesWithNames = data.map((share: HeirShare) => ({
        ...share,
        beneficiary_name:
          beneficiaries.find((b) => b.id === share.beneficiary_id)?.full_name ||
          "غير معروف",
      }));

      setPreviewShares(sharesWithNames);
      setIsPreviewMode(true);
    } catch (error: any) {
      toast.error("خطأ في حساب التوزيع: " + error.message);
    }
  };

  // Execute distribution
  const distributeMutation = useMutation({
    mutationFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const response = await supabase.functions.invoke("distribute-revenue", {
        body: {
          totalAmount: parseFloat(totalAmount),
          fiscalYearId: selectedFiscalYear,
          distributionDate,
          notes,
          notifyHeirs,
        },
      });

      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("تم توزيع الغلة بنجاح", {
        description: `تم توزيع ${parseFloat(totalAmount).toLocaleString("ar-SA")} ر.س على ${data.summary.heirsCount} وريث`,
      });
      queryClient.invalidateQueries({ queryKey: ["heir-distributions"] });
      queryClient.invalidateQueries({ queryKey: ["beneficiaries"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      resetForm();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error("خطأ في التوزيع", { description: error.message });
    },
  });

  const resetForm = () => {
    setTotalAmount("");
    setSelectedFiscalYear("");
    setDistributionDate(format(new Date(), "yyyy-MM-dd"));
    setNotes("");
    setNotifyHeirs(true);
    setPreviewShares([]);
    setIsPreviewMode(false);
  };

  const getHeirTypeColor = (type: string) => {
    switch (type) {
      case "زوجة":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300";
      case "ابن":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "بنت":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const summary = {
    wivesShare: previewShares
      .filter((s) => s.heir_type === "زوجة")
      .reduce((sum, s) => sum + s.share_amount, 0),
    sonsShare: previewShares
      .filter((s) => s.heir_type === "ابن")
      .reduce((sum, s) => sum + s.share_amount, 0),
    daughtersShare: previewShares
      .filter((s) => s.heir_type === "بنت")
      .reduce((sum, s) => sum + s.share_amount, 0),
    wivesCount: previewShares.filter((s) => s.heir_type === "زوجة").length,
    sonsCount: previewShares.filter((s) => s.heir_type === "ابن").length,
    daughtersCount: previewShares.filter((s) => s.heir_type === "بنت").length,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            توزيع غلة الوقف
          </DialogTitle>
          <DialogDescription>
            توزيع الغلة على الورثة حسب الشريعة الإسلامية (للذكر مثل حظ الأنثيين)
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh] px-1">
          <div className="space-y-6">
            {/* Input Section */}
            {!isPreviewMode && (
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
            )}

            {/* Preview Section */}
            {isPreviewMode && (
              <>
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">ملخص التوزيع</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="text-center p-3 bg-background rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          حصة الزوجات (الثمن)
                        </p>
                        <p className="text-lg font-bold text-pink-600">
                          {summary.wivesShare.toLocaleString("ar-SA")} ر.س
                        </p>
                        <Badge variant="outline" className="mt-1">
                          {summary.wivesCount} زوجات
                        </Badge>
                      </div>
                      <div className="text-center p-3 bg-background rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          حصة الأبناء
                        </p>
                        <p className="text-lg font-bold text-blue-600">
                          {summary.sonsShare.toLocaleString("ar-SA")} ر.س
                        </p>
                        <Badge variant="outline" className="mt-1">
                          {summary.sonsCount} أبناء
                        </Badge>
                      </div>
                      <div className="text-center p-3 bg-background rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          حصة البنات
                        </p>
                        <p className="text-lg font-bold text-purple-600">
                          {summary.daughtersShare.toLocaleString("ar-SA")} ر.س
                        </p>
                        <Badge variant="outline" className="mt-1">
                          {summary.daughtersCount} بنات
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    تفاصيل حصة كل وريث
                  </h4>
                  <div className="grid gap-2">
                    {previewShares.map((share, index) => (
                      <div
                        key={share.beneficiary_id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground text-sm">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-medium">{share.beneficiary_name}</p>
                            <Badge
                              variant="secondary"
                              className={getHeirTypeColor(share.heir_type)}
                            >
                              {share.heir_type}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-end">
                          <p className="font-bold">
                            {share.share_amount.toLocaleString("ar-SA")} ر.س
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {share.share_percentage}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-medium text-amber-800 dark:text-amber-200">
                          تنبيه مهم
                        </p>
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                          عند الاعتماد، سيتم إيداع المبالغ في حسابات الورثة فوراً
                          وستظهر لهم في لوحة التحكم الخاصة بهم.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2 sm:gap-0">
          {isPreviewMode ? (
            <>
              <Button variant="outline" onClick={() => setIsPreviewMode(false)}>
                تعديل
              </Button>
              <Button
                onClick={() => distributeMutation.mutate()}
                disabled={distributeMutation.isPending}
                className="gap-2"
              >
                {distributeMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                اعتماد التوزيع
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                إلغاء
              </Button>
              <Button
                onClick={calculatePreview}
                disabled={!totalAmount || !selectedFiscalYear}
              >
                معاينة التوزيع
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
