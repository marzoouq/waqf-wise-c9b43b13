/**
 * صفحة إدارة السنوات المالية وعمليات الإقفال
 * Fiscal Years Management Page
 */

import { useState } from "react";
import { MobileOptimizedLayout } from "@/components/layout/MobileOptimizedLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFiscalYears } from "@/hooks/accounting/useFiscalYears";
import { useFiscalYearClosings } from "@/hooks/accounting/useFiscalYearClosings";
import { CalendarIcon, Lock, Unlock, FileCheck, FileX, TrendingUp, AlertCircle, TestTube, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, arLocale as ar } from "@/lib/date";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FiscalYearSummaryCard } from "@/components/fiscal-years/FiscalYearSummaryCard";
import { ManualClosingDialog } from "@/components/fiscal-years/ManualClosingDialog";
import { AutomaticClosingDialog } from "@/components/fiscal-years/AutomaticClosingDialog";
import { FiscalYearTestPanel } from "@/components/fiscal-years/FiscalYearTestPanel";
import { AddFiscalYearDialog } from "@/components/fiscal-years/AddFiscalYearDialog";

export default function FiscalYearsManagement() {
  const { fiscalYears, isLoading: loadingYears } = useFiscalYears();
  const { closings, isLoading: loadingClosings } = useFiscalYearClosings();
  const [selectedYearId, setSelectedYearId] = useState<string | null>(null);
  const [manualClosingOpen, setManualClosingOpen] = useState(false);
  const [autoClosingOpen, setAutoClosingOpen] = useState(false);
  const [showTests, setShowTests] = useState(false);
  const [addYearOpen, setAddYearOpen] = useState(false);

  const selectedYear = fiscalYears?.find(y => y.id === selectedYearId);
  const selectedClosing = closings?.find(c => c.fiscal_year_id === selectedYearId);

  const activeYear = fiscalYears?.find(y => y.is_active);
  const closedYears = fiscalYears?.filter(y => y.is_closed) || [];
  const openYears = fiscalYears?.filter(y => !y.is_closed) || [];

  const handleManualClosing = () => {
    if (!selectedYear || selectedYear.is_closed) {
      return;
    }
    setManualClosingOpen(true);
  };

  const handleAutomaticClosing = () => {
    if (!selectedYear || selectedYear.is_closed) {
      return;
    }
    setAutoClosingOpen(true);
  };

  return (
    <MobileOptimizedLayout>
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">إدارة السنوات المالية</h1>
            <p className="text-muted-foreground">إقفال ومراجعة السنوات المالية</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setAddYearOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              إضافة سنة مالية
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowTests(!showTests)}
              className="gap-2"
            >
              <TestTube className="h-4 w-4" />
              {showTests ? "إخفاء الاختبارات" : "عرض الاختبارات"}
            </Button>
          </div>
        </div>
      </div>

      {/* لوحة الاختبارات */}
      {showTests && (
        <div className="mb-6">
          <FiscalYearTestPanel />
        </div>
      )}

        <div className="space-y-6">
          {/* تنبيه للسنة النشطة */}
          {activeYear && (
            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                السنة المالية النشطة حالياً: <strong>{activeYear.name}</strong>
                {" "}من {format(new Date(activeYear.start_date), "dd MMMM yyyy", { locale: ar })}
                {" "}إلى {format(new Date(activeYear.end_date), "dd MMMM yyyy", { locale: ar })}
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="open" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-auto">
              <TabsTrigger value="open" className="gap-1.5 sm:gap-2 text-xs sm:text-sm py-2.5">
                <Unlock className="h-4 w-4" />
                <span>المفتوحة ({openYears.length})</span>
              </TabsTrigger>
              <TabsTrigger value="closed" className="gap-1.5 sm:gap-2 text-xs sm:text-sm py-2.5">
                <Lock className="h-4 w-4" />
                <span>المغلقة ({closedYears.length})</span>
              </TabsTrigger>
            </TabsList>

            {/* السنوات المفتوحة */}
            <TabsContent value="open" className="space-y-4">
              {openYears.map((year) => (
                <Card
                  key={year.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedYearId === year.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedYearId(year.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <CardTitle className="text-lg">{year.name}</CardTitle>
                          <CardDescription>
                            {format(new Date(year.start_date), "dd MMMM yyyy", { locale: ar })}
                            {" - "}
                            {format(new Date(year.end_date), "dd MMMM yyyy", { locale: ar })}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {year.is_active && (
                          <Badge variant="default" className="gap-1">
                            <TrendingUp className="h-3 w-3" />
                            نشطة
                          </Badge>
                        )}
                        <Badge variant="outline" className="gap-1">
                          <Unlock className="h-3 w-3" />
                          مفتوحة
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}

              {openYears.length === 0 && (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <FileX className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>لا توجد سنوات مالية مفتوحة</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* السنوات المغلقة */}
            <TabsContent value="closed" className="space-y-4">
              {closedYears.map((year) => (
                <Card
                  key={year.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedYearId === year.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedYearId(year.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <CardTitle className="text-lg">{year.name}</CardTitle>
                          <CardDescription>
                            {format(new Date(year.start_date), "dd MMMM yyyy", { locale: ar })}
                            {" - "}
                            {format(new Date(year.end_date), "dd MMMM yyyy", { locale: ar })}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary" className="gap-1">
                        <Lock className="h-3 w-3" />
                        مغلقة
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              ))}

              {closedYears.length === 0 && (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <FileX className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>لا توجد سنوات مالية مغلقة</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* ملخص السنة المحددة */}
          {selectedYear && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>ملخص السنة المالية: {selectedYear.name}</CardTitle>
                    <CardDescription>
                      {selectedYear.is_closed ? "تم إقفال السنة" : "سنة مفتوحة للعمليات"}
                    </CardDescription>
                  </div>
                  {!selectedYear.is_closed && (
                    <div className="flex gap-2">
                      <Button onClick={handleManualClosing} variant="outline">
                        <FileCheck className="h-4 w-4 ml-2" />
                        إقفال يدوي
                      </Button>
                      <Button onClick={handleAutomaticClosing}>
                        <FileCheck className="h-4 w-4 ml-2" />
                        إقفال تلقائي
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <FiscalYearSummaryCard
                  fiscalYearId={selectedYear.id}
                  closing={selectedClosing}
                />
              </CardContent>
            </Card>
          )}

          {/* تنبيه عند عدم اختيار سنة */}
          {!selectedYear && (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg text-muted-foreground mb-2">
                  اختر سنة مالية لعرض تفاصيلها
                </p>
                <p className="text-sm text-muted-foreground">
                  انقر على أي سنة مالية أعلاه لعرض الملخص المالي وخيارات الإقفال
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* نوافذ الإقفال */}
        {selectedYear && (
          <>
            <ManualClosingDialog
              open={manualClosingOpen}
              onOpenChange={setManualClosingOpen}
              fiscalYear={selectedYear}
            />
            <AutomaticClosingDialog
              open={autoClosingOpen}
              onOpenChange={setAutoClosingOpen}
              fiscalYear={selectedYear}
            />
          </>
        )}

        {/* نافذة إضافة سنة مالية */}
        <AddFiscalYearDialog
          open={addYearOpen}
          onOpenChange={setAddYearOpen}
        />
      </MobileOptimizedLayout>
  );
}
