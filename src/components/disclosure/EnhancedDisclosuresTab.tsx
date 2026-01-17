/**
 * EnhancedDisclosuresTab - تبويب الإفصاحات المحسّن
 * @description يعرض قائمة الإفصاحات مع إمكانية عرض التفاصيل الكاملة
 * @version 2.9.0
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { matchesStatus } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Download, 
  Eye, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar,
  FileText,
  ChevronLeft,
  Loader2
} from "lucide-react";
import { useVisibilitySettings } from "@/hooks/governance/useVisibilitySettings";
import { useDisclosures } from "@/hooks/beneficiary/useBeneficiaryTabsData";
import { MaskedValue } from "@/components/shared/MaskedValue";
import { ViewDisclosureDialog } from "@/components/distributions/ViewDisclosureDialog";
import { AnnualDisclosure } from "@/hooks/reports/useAnnualDisclosures";
import { ErrorState } from "@/components/shared/ErrorState";
import { generateDisclosurePDF } from "@/lib/generateDisclosurePDF";
import { useDisclosureBeneficiaries } from "@/hooks/reports/useDisclosureBeneficiaries";
import { toast } from "sonner";

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("ar-SA", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export function EnhancedDisclosuresTab() {
  const navigate = useNavigate();
  const { settings } = useVisibilitySettings();
  const { data: disclosures, isLoading, error, refetch } = useDisclosures(settings?.show_disclosures || false);
  const [selectedDisclosure, setSelectedDisclosure] = useState<AnnualDisclosure | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const { fetchDisclosureBeneficiaries } = useDisclosureBeneficiaries();

  if (!settings?.show_disclosures) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
          غير مصرح بعرض الإفصاحات السنوية
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorState title="خطأ في تحميل الإفصاحات" message={(error as Error).message} onRetry={refetch} />;
  }

  const handleViewDetails = (disclosure: AnnualDisclosure) => {
    setSelectedDisclosure(disclosure);
    setDialogOpen(true);
  };

  const handleViewFullPage = (disclosure: AnnualDisclosure) => {
    navigate(`/beneficiary-portal?tab=disclosure-details&id=${disclosure.id}`);
  };

  const handleDownloadPDF = async (disclosure: AnnualDisclosure) => {
    setIsExporting(disclosure.id);
    try {
      const beneficiaries = await fetchDisclosureBeneficiaries(disclosure.id);
      await generateDisclosurePDF(disclosure, beneficiaries || []);
      toast.success("تم تحميل ملف PDF بنجاح");
    } catch (error) {
      toast.error("فشل تحميل ملف PDF");
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <>
      <div className="space-y-4">
        {disclosures?.map((disclosure, index) => {
          const previousYear = disclosures[index + 1] || null;
          const revenueChange = previousYear 
            ? ((disclosure.total_revenues - previousYear.total_revenues) / previousYear.total_revenues) * 100 
            : null;

          return (
            <Card 
              key={disclosure.id} 
              className="overflow-hidden hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3 bg-gradient-to-l from-primary/5 to-transparent">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base sm:text-lg">
                        الإفصاح السنوي {disclosure.year - 1}-{disclosure.year}
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        {disclosure.waqf_name}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {revenueChange !== null && (
                      <Badge 
                        variant="outline" 
                        className={`text-[10px] sm:text-xs ${
                          revenueChange > 0 
                            ? 'text-success border-success/30 bg-success/10' 
                            : 'text-destructive border-destructive/30 bg-destructive/10'
                        }`}
                      >
                        {revenueChange > 0 ? (
                          <TrendingUp className="h-3 w-3 ms-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 ms-1" />
                        )}
                        {Math.abs(revenueChange).toFixed(0)}%
                      </Badge>
                    )}
                    <Badge variant={matchesStatus(disclosure.status, 'published') ? "default" : "secondary"}>
                      {matchesStatus(disclosure.status, 'published') ? "منشور" : "مسودة"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-4 space-y-4">
                {/* البطاقات المالية الرئيسية */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-success/10 rounded-lg text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-success" />
                      <span className="text-[10px] sm:text-xs font-medium text-muted-foreground">الإيرادات</span>
                    </div>
                    <p className="text-sm sm:text-xl font-bold text-success">
                      <MaskedValue
                        value={formatCurrency(disclosure.total_revenues)}
                        type="amount"
                        masked={settings?.mask_exact_amounts || false}
                      />
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-destructive/10 rounded-lg text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
                      <span className="text-[10px] sm:text-xs font-medium text-muted-foreground">المصروفات</span>
                    </div>
                    <p className="text-sm sm:text-xl font-bold text-destructive">
                      <MaskedValue
                        value={formatCurrency(disclosure.total_expenses)}
                        type="amount"
                        masked={settings?.mask_exact_amounts || false}
                      />
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-primary/10 rounded-lg text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                      <span className="text-[10px] sm:text-xs font-medium text-muted-foreground">الصافي</span>
                    </div>
                    <p className="text-sm sm:text-xl font-bold text-primary">
                      <MaskedValue
                        value={formatCurrency(disclosure.net_income)}
                        type="amount"
                        masked={settings?.mask_exact_amounts || false}
                      />
                    </p>
                  </div>
                </div>

                {/* معلومات المستفيدين */}
                {settings?.show_total_beneficiaries_count && (
                  <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-center gap-2 sm:gap-4 md:gap-8 py-2 px-3 bg-muted/50 rounded-lg text-xs sm:text-sm">
                    <div className="text-center">
                      <span className="text-muted-foreground">الورثة</span>
                      <p className="font-bold">{disclosure.total_beneficiaries}</p>
                    </div>
                    <div className="h-6 w-px bg-border" />
                    <div className="text-center">
                      <span className="text-muted-foreground">أبناء</span>
                      <p className="font-bold text-heir-son">{disclosure.sons_count}</p>
                    </div>
                    <div className="h-6 w-px bg-border" />
                    <div className="text-center">
                      <span className="text-muted-foreground">بنات</span>
                      <p className="font-bold text-heir-daughter">{disclosure.daughters_count}</p>
                    </div>
                    <div className="h-6 w-px bg-border" />
                    <div className="text-center">
                      <span className="text-muted-foreground">زوجات</span>
                      <p className="font-bold text-heir-wife">{disclosure.wives_count}</p>
                    </div>
                  </div>
                )}

                {/* أزرار الإجراءات */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    variant="default" 
                    className="flex-1"
                    onClick={() => handleViewFullPage(disclosure as AnnualDisclosure)}
                  >
                    <Eye className="h-4 w-4 ms-2" />
                    عرض التفاصيل الكاملة
                    <ChevronLeft className="h-4 w-4 me-2" />
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleViewDetails(disclosure as AnnualDisclosure)}
                  >
                    <Eye className="h-4 w-4 ms-2" />
                    معاينة سريعة
                  </Button>
                  
                  {settings?.allow_export_pdf && (
                    <Button 
                      variant="outline" 
                      className="flex-1 sm:flex-initial"
                      onClick={() => handleDownloadPDF(disclosure as AnnualDisclosure)}
                      disabled={isExporting === disclosure.id}
                    >
                      {isExporting === disclosure.id ? (
                        <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 ms-2" />
                      )}
                      {isExporting === disclosure.id ? "جاري التحميل..." : "تحميل PDF"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {(!disclosures || disclosures.length === 0) && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">لا توجد إفصاحات سنوية متاحة</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* حوار عرض التفاصيل */}
      <ViewDisclosureDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        disclosure={selectedDisclosure}
      />
    </>
  );
}
