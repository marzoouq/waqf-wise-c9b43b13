import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, FileText, Users, TrendingUp, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function HistoricalArchive() {
  const [activeTab, setActiveTab] = useState("summary");

  // جلب السنة المالية التاريخية
  const { data: historicalFiscalYear } = useQuery({
    queryKey: ["historical-fiscal-year"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fiscal_years")
        .select("*")
        .eq("is_closed", true)
        .order("end_date", { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // جلب القيود التاريخية
  const { data: historicalEntries } = useQuery({
    queryKey: ["historical-journal-entries", historicalFiscalYear?.id],
    queryFn: async () => {
      if (!historicalFiscalYear) return [];

      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("fiscal_year_id", historicalFiscalYear.id)
        .order("entry_date", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!historicalFiscalYear,
  });

  // جلب الفواتير التاريخية
  const { data: historicalInvoices } = useQuery({
    queryKey: ["historical-invoices", historicalFiscalYear?.id],
    queryFn: async () => {
      if (!historicalFiscalYear) return [];

      const { data, error } = await supabase
        .from("historical_invoices")
        .select("*")
        .eq("fiscal_year_id", historicalFiscalYear.id)
        .order("invoice_date", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!historicalFiscalYear,
  });

  // جلب توزيعات الورثة
  const { data: heirDistributions } = useQuery({
    queryKey: ["heir-distributions", historicalFiscalYear?.id],
    queryFn: async () => {
      if (!historicalFiscalYear) return [];

      const { data, error } = await supabase
        .from("heir_distributions")
        .select("*, beneficiaries(full_name, national_id, gender)")
        .eq("fiscal_year_id", historicalFiscalYear.id)
        .eq("is_historical", true)
        .order("heir_type", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!historicalFiscalYear,
  });

  const financialSummary = { totalRevenue: 1490380, totalExpenses: 125239.85 };

  const netIncome = (financialSummary?.totalRevenue || 0) - (financialSummary?.totalExpenses || 0);

  // ملخص توزيعات الورثة
  const heirsSummary = heirDistributions?.reduce(
    (acc, dist: any) => {
      if (dist.heir_type === "زوجة") {
        acc.wives += dist.share_amount;
        acc.wivesCount += 1;
      } else if (dist.heir_type === "ابن") {
        acc.sons += dist.share_amount;
        acc.sonsCount += 1;
      } else if (dist.heir_type === "ابنة") {
        acc.daughters += dist.share_amount;
        acc.daughtersCount += 1;
      }
      acc.total += dist.share_amount;
      return acc;
    },
    { wives: 0, sons: 0, daughters: 0, wivesCount: 0, sonsCount: 0, daughtersCount: 0, total: 0 }
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-right">الأرشيف التاريخي</h1>
          <p className="text-muted-foreground text-right mt-2">
            السجلات التاريخية للسنة المالية المغلقة
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          تصدير PDF
        </Button>
      </div>

      {historicalFiscalYear && (
        <Card className="p-6 bg-primary/5">
          <div className="flex items-center gap-4">
            <Calendar className="h-8 w-8 text-primary" />
            <div className="flex-1 text-right">
              <h2 className="text-xl font-semibold">{historicalFiscalYear.name}</h2>
              <p className="text-muted-foreground">
                من {format(new Date(historicalFiscalYear.start_date), "dd MMMM yyyy", { locale: ar })} إلى{" "}
                {format(new Date(historicalFiscalYear.end_date), "dd MMMM yyyy", { locale: ar })}
              </p>
            </div>
          </div>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" dir="rtl">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary">الملخص المالي</TabsTrigger>
          <TabsTrigger value="heirs">توزيعات الورثة</TabsTrigger>
          <TabsTrigger value="entries">القيود المحاسبية</TabsTrigger>
          <TabsTrigger value="invoices">الفواتير</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">إجمالي الإيرادات</p>
                  <p className="text-2xl font-bold text-green-600">
                    {financialSummary?.totalRevenue.toLocaleString("ar-SA")} ريال
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-red-500/10">
                  <TrendingUp className="h-6 w-6 text-red-600 rotate-180" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">إجمالي المصروفات</p>
                  <p className="text-2xl font-bold text-red-600">
                    {financialSummary?.totalExpenses.toLocaleString("ar-SA")} ريال
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">صافي الدخل</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {netIncome.toLocaleString("ar-SA")} ريال
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="heirs" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-right">ملخص التوزيع الشرعي</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-lg bg-purple-500/10">
                <p className="text-sm text-muted-foreground text-right">الزوجات ({heirsSummary?.wivesCount})</p>
                <p className="text-xl font-bold text-purple-600 text-right">
                  {heirsSummary?.wives.toLocaleString("ar-SA")} ريال
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-500/10">
                <p className="text-sm text-muted-foreground text-right">الأبناء ({heirsSummary?.sonsCount})</p>
                <p className="text-xl font-bold text-blue-600 text-right">
                  {heirsSummary?.sons.toLocaleString("ar-SA")} ريال
                </p>
              </div>
              <div className="p-4 rounded-lg bg-pink-500/10">
                <p className="text-sm text-muted-foreground text-right">البنات ({heirsSummary?.daughtersCount})</p>
                <p className="text-xl font-bold text-pink-600 text-right">
                  {heirsSummary?.daughters.toLocaleString("ar-SA")} ريال
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-right">تفاصيل الورثة</h3>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {heirDistributions?.map((dist: any) => (
                  <div
                    key={dist.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="text-right">
                      <p className="font-medium">{dist.beneficiaries?.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {dist.heir_type} - {dist.beneficiaries?.national_id}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-lg font-bold text-primary">
                        {dist.share_amount.toLocaleString("ar-SA")} ريال
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="entries" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-right">القيود المحاسبية التاريخية</h3>
            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {historicalEntries?.map((entry) => (
                  <Card key={entry.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-right">
                        <p className="font-semibold">{entry.entry_number}</p>
                        <p className="text-sm text-muted-foreground">{entry.description}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(entry.entry_date), "dd/MM/yyyy")}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      حالة القيد: {entry.status}
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-right">الفواتير المؤرشفة</h3>
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {historicalInvoices?.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div className="text-right">
                        <p className="font-medium">{invoice.invoice_number}</p>
                        <p className="text-sm text-muted-foreground">{invoice.vendor_name}</p>
                        <p className="text-xs text-muted-foreground">{invoice.category}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-primary">
                        {invoice.total_amount.toLocaleString("ar-SA")} ريال
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(invoice.invoice_date), "dd/MM/yyyy")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
