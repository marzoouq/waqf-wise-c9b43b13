/**
 * صفحة الدليل الإرشادي والحوكمة
 * اللائحة التنفيذية لوقف مرزوق علي الثبيتي
 */

import { useState } from "react";
import { ScrollText, Printer, Download, ChevronUp, Info, Calendar, Building2, Loader2 } from "lucide-react";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CoreValuesSection } from "@/components/governance/CoreValuesSection";
import { RegulationsContent } from "@/components/governance/RegulationsContent";
import { RegulationsSearchBar } from "@/components/governance/RegulationsSearchBar";
import { useRegulationsSearch } from "@/hooks/governance/useRegulationsSearch";
import { generateGovernancePDF } from "@/lib/pdf/governance-pdf";
import { toast } from "sonner";

const WaqfGovernanceGuide = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    filteredParts,
    goToResult,
    clearSearch,
    resultsCount,
    expandedParts,
    setExpandedParts,
  } = useRegulationsSearch();

  const scrollToTop = () => {
    const container = document.querySelector('[data-scroll-container]');
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      toast.info('جاري إنشاء ملف PDF...');
      await generateGovernancePDF();
      toast.success('تم تحميل اللائحة التنفيذية بنجاح');
    } catch (error) {
      toast.error('فشل إنشاء ملف PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <MobileOptimizedLayout className="relative">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <MobileOptimizedHeader
          title="الدليل الإرشادي والحوكمة"
          description="اللائحة التنفيذية لوقف مرزوق علي الثبيتي"
          icon={
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-600 to-red-700 shadow-xl shadow-red-500/40 ring-2 ring-red-500/20">
              <ScrollText className="h-7 w-7 text-primary-foreground" />
            </div>
          }
        />
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">طباعة</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
          >
            {isGeneratingPDF ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">تحميل PDF</span>
          </Button>
        </div>
      </div>

      {/* شريط البحث */}
      <RegulationsSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClear={clearSearch}
        searchResults={searchResults}
        onResultClick={goToResult}
        resultsCount={resultsCount}
      />

      {/* معلومات الوقف الأساسية */}
      <Card className="mb-6 border-red-200 dark:border-red-800/30 bg-gradient-to-br from-red-50/50 to-background dark:from-red-950/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
              <Building2 className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-lg">معلومات الوقف</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">اسم الوقف</p>
              <p className="font-semibold text-foreground">وقف مرزوق علي الثبيتي</p>
            </div>
            <div className="space-y-1 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">تاريخ الإنشاء</p>
                <p className="font-semibold text-foreground">5/5/1441هـ</p>
              </div>
            </div>
            <div className="space-y-1 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">تاريخ التأسيس</p>
                <p className="font-semibold text-foreground">30/03/1445هـ</p>
              </div>
            </div>
            <div className="space-y-1 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">تاريخ التنفيذ</p>
                <p className="font-semibold text-foreground">30/6/1446هـ</p>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* الجهات المعنية */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Info className="h-4 w-4 text-red-500" />
              الجهات المعنية
            </h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                الهيئة العامة للأوقاف
              </Badge>
              <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                الناظر المعين
              </Badge>
              <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                ورثة الواقف
              </Badge>
              <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                الجهات القضائية المختصة
              </Badge>
            </div>
          </div>

          <Separator className="my-4" />

          {/* الأثر المتوقع */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">الأثر المتوقع</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-700 dark:text-green-300">تعزيز التنمية الاجتماعية والاقتصادية</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300">الحفاظ على الأصول الوقفية وتنميتها</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-purple-700 dark:text-purple-300">تحقيق الغبطة والمصلحة العامة</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* القيم الأساسية */}
      <CoreValuesSection />

      {/* محتوى اللائحة مع دعم البحث */}
      <RegulationsContent 
        filteredParts={filteredParts}
        expandedParts={expandedParts}
        onExpandedChange={setExpandedParts}
        searchQuery={searchQuery}
      />

      {/* زر العودة للأعلى */}
      {showScrollTop && (
        <Button
          variant="secondary"
          size="icon"
          className="fixed bottom-6 left-6 z-50 rounded-full shadow-lg"
          onClick={scrollToTop}
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
      )}
    </MobileOptimizedLayout>
  );
};

export default WaqfGovernanceGuide;
