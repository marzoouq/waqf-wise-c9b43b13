import { useState } from "react";
import { MobileOptimizedLayout } from "@/components/layout/MobileOptimizedLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Download, FileText, AlertCircle } from "lucide-react";
import { LoadingState } from "@/components/shared/LoadingState";
import {
  generateCSVFile,
  generateMT940File,
  generateISO20022XML,
  downloadFile,
  BankTransferRecord,
} from "@/lib/bankFileGenerators";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function BankTransfers() {
  const { toast } = useToast();
  const [selectedFormat, setSelectedFormat] = useState<string>("csv");
  const [selectedDistribution, setSelectedDistribution] = useState<string>("");

  // جلب التوزيعات المعتمدة
  const { data: distributions = [], isLoading: loadingDistributions } = useQuery({
    queryKey: ["approved-distributions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("distributions")
        .select(`
          id,
          distribution_date,
          total_amount,
          status,
          distribution_details!inner(
            beneficiary_id,
            allocated_amount,
            beneficiaries!inner(
              full_name,
              bank_account_number,
              iban
            )
          )
        `)
        .eq("status", "معتمد")
        .order("distribution_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleExport = () => {
    if (!selectedDistribution) {
      toast({
        title: "⚠️ تنبيه",
        description: "يرجى اختيار توزيع أولاً",
        variant: "destructive",
      });
      return;
    }

    const distribution = distributions.find((d) => d.id === selectedDistribution);
    if (!distribution) return;

    // تحويل البيانات إلى سجلات
    interface DistributionDetail {
      beneficiaries?: {
        full_name?: string;
        bank_account_number?: string;
        iban?: string;
      };
      allocated_amount: number;
    }
    
    const records: BankTransferRecord[] = ((distribution.distribution_details || []) as DistributionDetail[]).map((detail) => ({
      beneficiary_name: detail.beneficiaries?.full_name || "غير محدد",
      account_number: detail.beneficiaries?.bank_account_number || "",
      iban: detail.beneficiaries?.iban || undefined,
      amount: detail.allocated_amount,
      reference: distribution.id,
      description: `توزيع بتاريخ ${format(new Date(distribution.distribution_date), "dd/MM/yyyy", { locale: ar })}`,
    }));

    const date = new Date();
    const dateStr = format(date, "yyyy-MM-dd");

    try {
      let content: string;
      let filename: string;
      let mimeType: string = "text/plain";

      switch (selectedFormat) {
        case "csv":
          content = generateCSVFile(records);
          filename = `bank_transfer_${dateStr}.csv`;
          mimeType = "text/csv";
          break;

        case "mt940":
          content = generateMT940File(records, "SA0000000000000000000000");
          filename = `bank_transfer_${dateStr}.mt940`;
          break;

        case "iso20022":
          content = generateISO20022XML(records, "صندوق الوقف", "SA0000000000000000000000");
          filename = `bank_transfer_${dateStr}.xml`;
          mimeType = "application/xml";
          break;

        default:
          throw new Error("صيغة غير مدعومة");
      }

      downloadFile(content, filename, mimeType);

      toast({
        title: "✅ تم التصدير بنجاح",
        description: `تم تصدير ${records.length} تحويل بنجي`,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "فشل في معالجة المستندات";
      toast({
        title: "❌ خطأ",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (loadingDistributions) {
    return <LoadingState />;
  }

  const selectedDist = distributions.find((d) => d.id === selectedDistribution);
  const recordsCount = selectedDist?.distribution_details?.length || 0;
  const totalAmount = selectedDist?.total_amount || 0;

  return (
    <PageErrorBoundary pageName="التحويلات البنكية">
      <MobileOptimizedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">تصدير التحويلات البنكية</h1>
          <p className="text-muted-foreground mt-2">
            تصدير ملفات التحويل البنكي بصيغ متعددة (CSV, MT940, ISO20022)
          </p>
        </div>

        {/* النموذج */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              إعدادات التصدير
            </CardTitle>
            <CardDescription>اختر التوزيع والصيغة المطلوبة للتصدير</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">التوزيع</label>
                <Select value={selectedDistribution} onValueChange={setSelectedDistribution}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر توزيع معتمد" />
                  </SelectTrigger>
                  <SelectContent>
                    {distributions.map((dist) => (
                      <SelectItem key={dist.id} value={dist.id}>
                        {format(new Date(dist.distribution_date), "dd/MM/yyyy", { locale: ar })} (
                        {dist.total_amount.toLocaleString("ar-SA")} ریال)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">صيغة الملف</label>
                <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV (للبنوك المحلية)</SelectItem>
                    <SelectItem value="mt940">MT940 (للبنوك الدولية)</SelectItem>
                    <SelectItem value="iso20022">ISO20022 XML</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedDistribution && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">عدد التحويلات:</span>
                  <span className="font-semibold">{recordsCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">إجمالي المبلغ:</span>
                  <span className="font-semibold">{totalAmount.toLocaleString("ar-SA")} ريال</span>
                </div>
              </div>
            )}

            <Button onClick={handleExport} disabled={!selectedDistribution} className="w-full" size="lg">
              <Download className="ml-2 h-4 w-4" />
              تصدير الملف
            </Button>
          </CardContent>
        </Card>

        {/* معلومات */}
        <Card>
          <CardHeader>
            <CardTitle>معلومات الصيغ المدعومة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-info flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-semibold">CSV (الأكثر شيوعاً)</h4>
                  <p className="text-sm text-muted-foreground">
                    مدعوم من معظم البنوك المحلية (الراجحي، الأهلي، الرياض). ملف نصي بسيط يمكن
                    فتحه بـ Excel.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-info flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-semibold">MT940</h4>
                  <p className="text-sm text-muted-foreground">
                    معيار SWIFT القديم للبنوك الدولية. يستخدم في التحويلات بين البنوك.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-info flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-semibold">ISO20022 XML</h4>
                  <p className="text-sm text-muted-foreground">
                    المعيار الدولي الحديث (pain.001). مدعوم من البنوك العالمية والأنظمة الحديثة.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
}
