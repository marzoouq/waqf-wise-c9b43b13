import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Eye, 
  Download,
  TrendingUp,
  Users,
  DollarSign,
  Calendar
} from "lucide-react";
import { useAnnualDisclosures } from "@/hooks/useAnnualDisclosures";
import { ViewDisclosureDialog } from "@/components/distributions/ViewDisclosureDialog";
import { generateDisclosurePDF } from "@/lib/generateDisclosurePDF";
import { supabase } from "@/integrations/supabase/client";

export const AnnualDisclosureCard = () => {
  const { disclosures, isLoading } = useAnnualDisclosures();
  const [selectedDisclosure, setSelectedDisclosure] = useState<any>(null);
  const [viewOpen, setViewOpen] = useState(false);

  // عرض الإفصاحات المنشورة فقط
  const publishedDisclosures = disclosures.filter(d => d.status === 'published');
  const latestDisclosure = publishedDisclosures[0];

  const handleExportPDF = async (disclosure: any) => {
    try {
      const { data: beneficiaries } = await supabase
        .from("disclosure_beneficiaries")
        .select("*")
        .eq("disclosure_id", disclosure.id);
      
      await generateDisclosurePDF(disclosure, beneficiaries || []);
    } catch (error) {
      console.error("Error exporting PDF:", error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            الإفصاح السنوي
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">جاري التحميل...</p>
        </CardContent>
      </Card>
    );
  }

  if (publishedDisclosures.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            الإفصاح السنوي
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            لا توجد إفصاحات سنوية منشورة حتى الآن
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              الإفصاح السنوي - {latestDisclosure.year}
            </CardTitle>
            <Badge variant="default">
              {latestDisclosure.waqf_name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <p className="text-xs text-green-600">إجمالي الإيرادات</p>
              </div>
              <p className="text-lg font-bold text-green-700">
                {latestDisclosure.total_revenues.toLocaleString()}
              </p>
            </div>

            <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-3 w-3 text-red-600" />
                <p className="text-xs text-red-600">إجمالي المصروفات</p>
              </div>
              <p className="text-lg font-bold text-red-700">
                {latestDisclosure.total_expenses.toLocaleString()}
              </p>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-3 w-3 text-blue-600" />
                <p className="text-xs text-blue-600">صافي الدخل</p>
              </div>
              <p className="text-lg font-bold text-blue-700">
                {latestDisclosure.net_income.toLocaleString()}
              </p>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-3 w-3 text-amber-600" />
                <p className="text-xs text-amber-600">المستفيدون</p>
              </div>
              <p className="text-lg font-bold text-amber-700">
                {latestDisclosure.total_beneficiaries}
              </p>
            </div>
          </div>

          {/* تاريخ الإفصاح */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              تاريخ الإصدار: {new Date(latestDisclosure.disclosure_date).toLocaleDateString('ar-SA')}
            </span>
          </div>

          {/* الأزرار */}
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setSelectedDisclosure(latestDisclosure);
                setViewOpen(true);
              }}
              className="flex-1 gap-2"
            >
              <Eye className="h-4 w-4" />
              عرض التفاصيل الكاملة
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleExportPDF(latestDisclosure)}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              تحميل PDF
            </Button>
          </div>

          {/* الإفصاحات السابقة */}
          {publishedDisclosures.length > 1 && (
            <div className="pt-3 border-t">
              <p className="text-sm font-medium mb-2">الإفصاحات السابقة:</p>
              <div className="space-y-2">
                {publishedDisclosures.slice(1, 4).map((disclosure) => (
                  <div key={disclosure.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">سنة {disclosure.year}</span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedDisclosure(disclosure);
                          setViewOpen(true);
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExportPDF(disclosure)}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ViewDisclosureDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        disclosure={selectedDisclosure}
      />
    </>
  );
};
