import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, Users, TrendingUp, TrendingDown } from "lucide-react";
import { useVisibilitySettings } from "@/hooks/useVisibilitySettings";
import { MaskedValue } from "@/components/shared/MaskedValue";

export function DisclosuresTab() {
  const { settings } = useVisibilitySettings();

  const { data: disclosures, isLoading } = useQuery({
    queryKey: ["annual-disclosures-beneficiary"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("annual_disclosures")
        .select("*")
        .order("year", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: settings?.show_disclosures || false,
  });

  if (!settings?.show_disclosures) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          غير مصرح بعرض الإفصاحات السنوية
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {disclosures?.map((disclosure) => (
        <Card key={disclosure.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>الإفصاح السنوي - {disclosure.year}</CardTitle>
                <CardDescription>{disclosure.waqf_name}</CardDescription>
              </div>
              <Badge variant={disclosure.status === "published" ? "default" : "secondary"}>
                {disclosure.status === "published" ? "منشور" : "مسودة"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* الملخص المالي */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-success/10 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span className="text-sm font-medium">الإيرادات</span>
                </div>
                <p className="text-2xl font-bold">
                  <MaskedValue
                    value={disclosure.total_revenues.toLocaleString("ar-SA")}
                    type="amount"
                    masked={settings?.mask_exact_amounts || false}
                  />
                </p>
              </div>

              <div className="p-4 bg-destructive/10 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-medium">المصروفات</span>
                </div>
                <p className="text-2xl font-bold">
                  <MaskedValue
                    value={disclosure.total_expenses.toLocaleString("ar-SA")}
                    type="amount"
                    masked={settings?.mask_exact_amounts || false}
                  />
                </p>
              </div>

              <div className="p-4 bg-primary/10 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">صافي الدخل</span>
                </div>
                <p className="text-2xl font-bold">
                  <MaskedValue
                    value={disclosure.net_income.toLocaleString("ar-SA")}
                    type="amount"
                    masked={settings?.mask_exact_amounts || false}
                  />
                </p>
              </div>
            </div>

            {/* المستفيدون */}
            {settings?.show_total_beneficiaries_count && (
              <div className="grid gap-4 md:grid-cols-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي المستفيدين</p>
                  <p className="text-xl font-bold">{disclosure.total_beneficiaries}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الأبناء</p>
                  <p className="text-xl font-bold">{disclosure.sons_count}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">البنات</p>
                  <p className="text-xl font-bold">{disclosure.daughters_count}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الزوجات</p>
                  <p className="text-xl font-bold">{disclosure.wives_count}</p>
                </div>
              </div>
            )}

            {/* التوزيعات */}
            {settings?.show_expenses_breakdown && (
              <div className="space-y-2">
                <h4 className="font-medium">توزيع الاستقطاعات</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>حصة الناظر ({disclosure.nazer_percentage}%)</span>
                    <span className="font-mono">
                      <MaskedValue
                        value={disclosure.nazer_share.toLocaleString("ar-SA")}
                        type="amount"
                        masked={settings?.mask_exact_amounts || false}
                      /> ريال
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>حصة الخير ({disclosure.charity_percentage}%)</span>
                    <span className="font-mono">
                      <MaskedValue
                        value={disclosure.charity_share.toLocaleString("ar-SA")}
                        type="amount"
                        masked={settings?.mask_exact_amounts || false}
                      /> ريال
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>حصة الأصول ({disclosure.corpus_percentage}%)</span>
                    <span className="font-mono">
                      <MaskedValue
                        value={disclosure.corpus_share.toLocaleString("ar-SA")}
                        type="amount"
                        masked={settings?.mask_exact_amounts || false}
                      /> ريال
                    </span>
                  </div>
                </div>
              </div>
            )}

            {settings?.allow_export_pdf && (
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 ml-2" />
                تحميل الإفصاح الكامل PDF
              </Button>
            )}
          </CardContent>
        </Card>
      ))}

      {(!disclosures || disclosures.length === 0) && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            لا توجد إفصاحات سنوية متاحة
          </CardContent>
        </Card>
      )}
    </div>
  );
}
