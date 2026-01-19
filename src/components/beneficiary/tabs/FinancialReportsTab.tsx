/**
 * Financial Reports Tab for Beneficiaries
 * @version 3.0.0
 * 
 * تبويب التقارير المالية للمستفيد
 * - عرض التقارير المتاحة من قاعدة البيانات
 * - توليد PDF للتقارير
 * - عرض ملخصات مالية
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Download, 
  Eye, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  PieChart,
  BarChart3,
  Calendar,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useVisibilitySettings } from "@/hooks/governance/useVisibilitySettings";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBeneficiaryId } from "@/hooks/beneficiary/useBeneficiaryId";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { generateDisclosurePDF } from "@/lib/generateDisclosurePDF";
import { useDisclosureBeneficiaries } from "@/hooks/reports/useDisclosureBeneficiaries";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { QUERY_KEYS } from "@/lib/query-keys";

// أنواع التقارير
const REPORT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  financial: TrendingUp,
  distributions: PieChart,
  beneficiaries: DollarSign,
  properties: BarChart3,
  approvals: CheckCircle,
  default: FileText
};

interface ReportTemplate {
  id: string;
  template_name: string;
  report_type: string;
  description: string | null;
  is_public: boolean;
}

interface FinancialSummary {
  totalReceived: number;
  pendingAmount: number;
  lastDistributionDate: string | null;
  distributionsCount: number;
}

// أنواع التقارير السريعة
type QuickReportType = 'monthly' | 'annual' | 'pending' | null;

export function FinancialReportsTab() {
  const { settings, isLoading: settingsLoading } = useVisibilitySettings();
  const { beneficiaryId, isLoading: beneficiaryLoading } = useBeneficiaryId();
  const { fetchDisclosureBeneficiaries } = useDisclosureBeneficiaries();
  const [selectedReport, setSelectedReport] = useState<ReportTemplate | null>(null);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [quickReportType, setQuickReportType] = useState<QuickReportType>(null);

  // جلب قوالب التقارير من قاعدة البيانات
  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: QUERY_KEYS.REPORT_TEMPLATES('public'),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('report_templates')
        .select('id, template_name, report_type, description, is_public')
        .eq('is_public', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ReportTemplate[];
    },
    enabled: !!settings?.show_financial_reports
  });

  // جلب الإفصاح السنوي المنشور
  const { data: disclosure, isLoading: disclosureLoading } = useQuery({
    queryKey: ['annual-disclosure-latest'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('annual_disclosures')
        .select('*')
        .eq('status', 'published')
        .order('year', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!settings?.show_financial_reports
  });

  // جلب ملخص مالي للمستفيد مع تفاصيل التوزيعات الشهرية
  const { data: financialSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ['beneficiary-financial-summary', beneficiaryId],
    queryFn: async () => {
      if (!beneficiaryId) return null;

      // جلب معلومات المستفيد
      const { data: beneficiary } = await supabase
        .from('beneficiaries')
        .select('total_received, pending_amount')
        .eq('id', beneficiaryId)
        .maybeSingle();

      // جلب سجل التوزيعات
      const { data: distributions, count } = await supabase
        .from('heir_distributions')
        .select('distribution_date', { count: 'exact' })
        .eq('beneficiary_id', beneficiaryId)
        .order('distribution_date', { ascending: false })
        .limit(1);

      return {
        totalReceived: beneficiary?.total_received || 0,
        pendingAmount: beneficiary?.pending_amount || 0,
        lastDistributionDate: distributions?.[0]?.distribution_date || null,
        distributionsCount: count || 0
      } as FinancialSummary;
    },
    enabled: !!beneficiaryId && !!settings?.show_financial_reports
  });

  // جلب تفاصيل التوزيعات الشهرية (آخر 12 شهر)
  const { data: monthlyDistributions = [] } = useQuery({
    queryKey: ['beneficiary-monthly-distributions', beneficiaryId],
    queryFn: async () => {
      if (!beneficiaryId) return [];

      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const { data, error } = await supabase
        .from('heir_distributions')
        .select('id, share_amount, distribution_date, heir_type, notes')
        .eq('beneficiary_id', beneficiaryId)
        .gte('distribution_date', oneYearAgo.toISOString())
        .order('distribution_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!beneficiaryId && quickReportType === 'monthly'
  });

  // جلب ملخص السنة الحالية
  const { data: annualSummary } = useQuery({
    queryKey: ['beneficiary-annual-summary', beneficiaryId],
    queryFn: async () => {
      if (!beneficiaryId) return null;

      const currentYear = new Date().getFullYear();
      const startOfYear = `${currentYear}-01-01`;
      const endOfYear = `${currentYear}-12-31`;

      const { data, error } = await supabase
        .from('heir_distributions')
        .select('share_amount, distribution_date, heir_type')
        .eq('beneficiary_id', beneficiaryId)
        .gte('distribution_date', startOfYear)
        .lte('distribution_date', endOfYear);

      if (error) throw error;

      const total = data?.reduce((sum, d) => sum + (d.share_amount || 0), 0) || 0;
      const byType: Record<string, number> = {};
      data?.forEach(d => {
        const type = d.heir_type || 'أخرى';
        byType[type] = (byType[type] || 0) + (d.share_amount || 0);
      });

      return {
        year: currentYear,
        totalAmount: total,
        distributionsCount: data?.length || 0,
        byType
      };
    },
    enabled: !!beneficiaryId && quickReportType === 'annual'
  });

  // توليد PDF للإفصاح السنوي
  const handleDownloadDisclosurePDF = async () => {
    if (!disclosure) {
      toast.error("لا يوجد إفصاح سنوي منشور");
      return;
    }

    setIsGenerating('disclosure');
    try {
      const beneficiaries = await fetchDisclosureBeneficiaries(disclosure.id);
      // لا توجد سنة سابقة متوفرة هنا، نمرر null
      await generateDisclosurePDF(disclosure, beneficiaries || [], null);
      toast.success("تم تحميل ملف PDF بنجاح");
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error("حدث خطأ أثناء توليد التقرير");
    } finally {
      setIsGenerating(null);
    }
  };

  // عرض تفاصيل التقرير
  const handleViewReport = (template: ReportTemplate) => {
    setSelectedReport(template);
  };

  // فحص الصلاحيات
  if (settingsLoading || beneficiaryLoading) {
    return (
      <Card>
        <CardContent className="p-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-9 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!settings?.show_financial_reports) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">غير مصرح بعرض التقارير المالية</p>
        </CardContent>
      </Card>
    );
  }

  const isLoading = templatesLoading || disclosureLoading || summaryLoading;

  return (
    <div className="space-y-6">
      {/* ملخص مالي سريع */}
      {financialSummary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي المستلم</p>
                  <p className="text-2xl font-bold text-primary">
                    {settings?.mask_exact_amounts 
                      ? '***' 
                      : financialSummary.totalReceived.toLocaleString('ar-SA')} ر.س
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary/20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">المبالغ المعلقة</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {settings?.mask_exact_amounts 
                      ? '***' 
                      : financialSummary.pendingAmount.toLocaleString('ar-SA')} ر.س
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-amber-600/20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">عدد التوزيعات</p>
                  <p className="text-2xl font-bold">{financialSummary.distributionsCount}</p>
                  {financialSummary.lastDistributionDate && (
                    <p className="text-xs text-muted-foreground mt-1">
                      آخر توزيع: {format(new Date(financialSummary.lastDistributionDate), 'dd MMM yyyy', { locale: ar })}
                    </p>
                  )}
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground/20" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* الإفصاح السنوي */}
      {disclosure && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                الإفصاح السنوي {disclosure.year}
              </CardTitle>
              <Badge variant="default" className="bg-green-600">
                منشور
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-background rounded-lg">
                <p className="text-xs text-muted-foreground">إجمالي الإيرادات</p>
                <p className="font-semibold text-green-600">
                  {settings?.mask_exact_amounts ? '***' : disclosure.total_revenues?.toLocaleString('ar-SA')} ر.س
                </p>
              </div>
              <div className="text-center p-3 bg-background rounded-lg">
                <p className="text-xs text-muted-foreground">إجمالي المصروفات</p>
                <p className="font-semibold text-red-600">
                  {settings?.mask_exact_amounts ? '***' : disclosure.total_expenses?.toLocaleString('ar-SA')} ر.س
                </p>
              </div>
              <div className="text-center p-3 bg-background rounded-lg">
                <p className="text-xs text-muted-foreground">صافي الدخل</p>
                <p className="font-semibold text-primary">
                  {settings?.mask_exact_amounts ? '***' : disclosure.net_income?.toLocaleString('ar-SA')} ر.س
                </p>
              </div>
              <div className="text-center p-3 bg-background rounded-lg">
                <p className="text-xs text-muted-foreground">حصة الورثة</p>
                <p className="font-semibold">
                  {settings?.mask_exact_amounts ? '***' : disclosure.charity_share?.toLocaleString('ar-SA')} ر.س
                </p>
              </div>
            </div>
            
            {settings?.allow_export_pdf && (
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDownloadDisclosurePDF}
                  disabled={isGenerating === 'disclosure'}
                >
                  {isGenerating === 'disclosure' ? (
                    <Loader2 className="h-4 w-4 animate-spin ms-2" />
                  ) : (
                    <Download className="h-4 w-4 ms-2" />
                  )}
                  تحميل PDF
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* قوالب التقارير */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            التقارير المالية المتاحة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>لا توجد تقارير متاحة حالياً</p>
            </div>
          ) : (
            templates.map((template) => {
              const Icon = REPORT_ICONS[template.report_type] || REPORT_ICONS.default;
              return (
                <div 
                  key={template.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{template.template_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {template.description || `تقرير ${template.report_type}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewReport(template)}
                    >
                      <Eye className="h-4 w-4 ms-2" />
                      عرض
                    </Button>
                    {settings?.allow_export_pdf && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          toast.info("جاري تجهيز التقرير...");
                          // يمكن إضافة توليد PDF هنا لاحقاً
                        }}
                      >
                        <Download className="h-4 w-4 ms-2" />
                        PDF
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* تقارير إضافية ثابتة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            تقارير سريعة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            {
              id: 'monthly',
              name: 'ملخص التوزيعات الشهرية',
              description: 'عرض توزيعاتك خلال الأشهر الماضية',
              icon: TrendingUp
            },
            {
              id: 'annual',
              name: 'الملخص السنوي',
              description: 'إجمالي ما تم استلامه خلال السنة',
              icon: Calendar
            },
            {
              id: 'pending',
              name: 'المبالغ المعلقة',
              description: 'المبالغ في انتظار الصرف',
              icon: DollarSign
            }
          ].map((report) => {
            const Icon = report.icon;
            return (
              <div 
                key={report.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-medium">{report.name}</h4>
                    <p className="text-sm text-muted-foreground">{report.description}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setQuickReportType(report.id as QuickReportType)}
                >
                  <Eye className="h-4 w-4 ms-2" />
                  عرض
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Dialog لعرض تفاصيل التقرير */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {selectedReport?.template_name}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 p-4">
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">محتوى التقرير</p>
                <p className="text-sm">
                  {selectedReport?.description || 'تفاصيل التقرير ستظهر هنا'}
                </p>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">نوع التقرير:</span>
                  <span className="me-2 font-medium">{selectedReport?.report_type}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">الحالة:</span>
                  <Badge variant="outline" className="me-2">
                    {selectedReport?.is_public ? 'عام' : 'خاص'}
                  </Badge>
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Dialog للتقارير السريعة */}
      <Dialog open={!!quickReportType} onOpenChange={() => setQuickReportType(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {quickReportType === 'monthly' && <TrendingUp className="h-5 w-5" />}
              {quickReportType === 'annual' && <Calendar className="h-5 w-5" />}
              {quickReportType === 'pending' && <DollarSign className="h-5 w-5" />}
              {quickReportType === 'monthly' && 'ملخص التوزيعات الشهرية'}
              {quickReportType === 'annual' && 'الملخص السنوي'}
              {quickReportType === 'pending' && 'المبالغ المعلقة'}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 p-4">
              {/* محتوى التوزيعات الشهرية */}
              {quickReportType === 'monthly' && (
                <div className="space-y-4">
                  <div className="text-center py-4 border-b">
                    <p className="text-lg font-bold text-primary">
                      آخر 12 شهر
                    </p>
                    <p className="text-sm text-muted-foreground">
                      عدد التوزيعات: {monthlyDistributions.length}
                    </p>
                  </div>
                  {monthlyDistributions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <TrendingDown className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>لا توجد توزيعات خلال الفترة الماضية</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {monthlyDistributions.map((dist) => (
                        <div key={dist.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">{dist.heir_type}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(dist.distribution_date), 'dd MMMM yyyy', { locale: ar })}
                            </p>
                          </div>
                          <span className="font-bold text-primary">
                            {dist.share_amount?.toLocaleString('ar-SA')} ر.س
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* محتوى الملخص السنوي */}
              {quickReportType === 'annual' && (
                <div className="space-y-4">
                  <div className="text-center py-4 border-b">
                    <p className="text-lg font-bold text-primary">
                      سنة {annualSummary?.year || new Date().getFullYear()}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-primary/10 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">إجمالي المستلم</p>
                      <p className="text-2xl font-bold text-primary">
                        {(annualSummary?.totalAmount || 0).toLocaleString('ar-SA')} ر.س
                      </p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">عدد التوزيعات</p>
                      <p className="text-2xl font-bold">
                        {annualSummary?.distributionsCount || 0}
                      </p>
                    </div>
                  </div>
                  {annualSummary?.byType && Object.keys(annualSummary.byType).length > 0 && (
                    <div className="space-y-2">
                      <p className="font-medium">توزيع حسب النوع:</p>
                      {Object.entries(annualSummary.byType).map(([type, amount]) => (
                        <div key={type} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <span>{type}</span>
                          <span className="font-bold">{amount.toLocaleString('ar-SA')} ر.س</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* محتوى المبالغ المعلقة */}
              {quickReportType === 'pending' && (
                <div className="space-y-4">
                  <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-lg text-center">
                    <DollarSign className="h-12 w-12 mx-auto mb-4 text-amber-600" />
                    <p className="text-sm text-muted-foreground mb-2">المبالغ في انتظار الصرف</p>
                    <p className="text-3xl font-bold text-amber-600">
                      {(financialSummary?.pendingAmount || 0).toLocaleString('ar-SA')} ر.س
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground text-center">
                    <p>هذه المبالغ قيد المعالجة وسيتم صرفها قريباً</p>
                    <p>في حال وجود استفسار، يرجى التواصل مع الإدارة</p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
