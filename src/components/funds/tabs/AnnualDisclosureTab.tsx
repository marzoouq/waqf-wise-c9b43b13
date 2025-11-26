import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollableTableWrapper } from "@/components/shared/ScrollableTableWrapper";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Eye,
  FileCheck,
  Download,
  Calendar,
  BarChart3,
  TrendingDown,
  Plus,
} from "lucide-react";
import { useAnnualDisclosures, AnnualDisclosure } from "@/hooks/useAnnualDisclosures";
import { GenerateDisclosureDialog } from "@/components/distributions/GenerateDisclosureDialog";
import { ViewDisclosureDialog } from "@/components/distributions/ViewDisclosureDialog";
import { generateDisclosurePDF } from "@/lib/generateDisclosurePDF";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

export function AnnualDisclosureTab() {
  const { disclosures, currentYearDisclosure, isLoading, publishDisclosure } = useAnnualDisclosures();
  const [selectedDisclosure, setSelectedDisclosure] = useState<AnnualDisclosure | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // بيانات المقارنة السنوية
  const comparisonData = (disclosures || []).slice(0, 5).reverse().map(d => ({
    year: d.year.toString(),
    revenues: d.total_revenues,
    expenses: d.total_expenses,
    netIncome: d.net_income,
    beneficiaries: d.total_beneficiaries,
  }));

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      draft: "secondary",
      published: "default",
      archived: "outline",
    };
    const labels: Record<string, string> = {
      draft: "مسودة",
      published: "منشور",
      archived: "مؤرشف",
    };
    return <Badge variant={variants[status] || "secondary"}>{labels[status] || status}</Badge>;
  };

  const handlePublish = async (disclosureId: string) => {
    setPublishing(true);
    try {
      await publishDisclosure(disclosureId);
    } finally {
      setPublishing(false);
    }
  };

  const handleExportPDF = async (disclosure: AnnualDisclosure) => {
    try {
      const { data: beneficiaries } = await supabase
        .from("disclosure_beneficiaries")
        .select("*")
        .eq("disclosure_id", disclosure.id);
      
      await generateDisclosurePDF(disclosure, beneficiaries || []);
    } catch (error) {
      // Error already handled in generateDisclosurePDF
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="current">الإفصاح الحالي</TabsTrigger>
          <TabsTrigger value="history">السجل التاريخي</TabsTrigger>
          <TabsTrigger value="comparison">المقارنات السنوية</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          {currentYearDisclosure ? (
            <Card className="border-primary">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    الإفصاح السنوي - {currentYearDisclosure.year}
                  </CardTitle>
                  {getStatusBadge(currentYearDisclosure.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1 p-3 bg-success-light dark:bg-success/10 rounded-lg border border-success/30">
                    <p className="text-sm text-success">إجمالي الإيرادات</p>
                    <p className="text-2xl font-bold text-success">
                      {currentYearDisclosure.total_revenues.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">ريال سعودي</p>
                  </div>
                  
                  <div className="space-y-1 p-3 bg-destructive-light dark:bg-destructive/10 rounded-lg border border-destructive/30">
                    <p className="text-sm text-destructive">إجمالي المصروفات</p>
                    <p className="text-2xl font-bold text-destructive">
                      {currentYearDisclosure.total_expenses.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">ريال سعودي</p>
                  </div>
                  
                  <div className="space-y-1 p-3 bg-info-light dark:bg-info/10 rounded-lg border border-info/30">
                    <p className="text-sm text-info">صافي الدخل</p>
                    <p className="text-2xl font-bold text-info">
                      {currentYearDisclosure.net_income.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">ريال سعودي</p>
                  </div>
                  
                  <div className="space-y-1 p-3 bg-warning-light rounded-lg border border-warning">
                    <p className="text-sm text-warning">عدد المستفيدين</p>
                    <p className="text-2xl font-bold text-warning-foreground">
                      {currentYearDisclosure.total_beneficiaries}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ({currentYearDisclosure.sons_count} أبناء، {currentYearDisclosure.daughters_count} بنات، {currentYearDisclosure.wives_count} زوجات)
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1 p-3 border rounded-lg">
                    <p className="text-sm text-muted-foreground">حصة الناظر</p>
                    <p className="text-lg font-bold">
                      {currentYearDisclosure.nazer_share.toLocaleString()} ر.س
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ({currentYearDisclosure.nazer_percentage}%)
                    </p>
                  </div>

                  <div className="space-y-1 p-3 border rounded-lg">
                    <p className="text-sm text-muted-foreground">صدقة الواقف</p>
                    <p className="text-lg font-bold">
                      {currentYearDisclosure.charity_share.toLocaleString()} ر.س
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ({currentYearDisclosure.charity_percentage}%)
                    </p>
                  </div>

                  <div className="space-y-1 p-3 border rounded-lg">
                    <p className="text-sm text-muted-foreground">رأس مال الوقف</p>
                    <p className="text-lg font-bold">
                      {currentYearDisclosure.corpus_share.toLocaleString()} ر.س
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ({currentYearDisclosure.corpus_percentage}%)
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={() => {
                      setSelectedDisclosure(currentYearDisclosure);
                      setViewOpen(true);
                    }}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    عرض التفاصيل الكاملة
                  </Button>
                  
                  {currentYearDisclosure.status === 'draft' && (
                    <Button 
                      variant="outline" 
                      className="gap-2"
                      onClick={() => handlePublish(currentYearDisclosure.id)}
                      disabled={publishing}
                    >
                      <FileCheck className="h-4 w-4" />
                      {publishing ? "جاري النشر..." : "نشر الإفصاح"}
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => handleExportPDF(currentYearDisclosure)}
                  >
                    <Download className="h-4 w-4" />
                    تصدير PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">لا يوجد إفصاح للسنة الحالية</p>
                  <p className="text-sm mt-2">يمكنك إنشاء إفصاح جديد من الزر أدناه</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end">
            <Button onClick={() => setGenerateOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              إنشاء إفصاح سنة جديدة
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                الإفصاحات السنوية السابقة
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center py-8 text-muted-foreground">جاري التحميل...</p>
              ) : disclosures.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">لا توجد إفصاحات سنوية</p>
              ) : (
                <ScrollableTableWrapper>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>السنة</TableHead>
                        <TableHead>اسم الوقف</TableHead>
                        <TableHead>الإيرادات</TableHead>
                        <TableHead>المصروفات</TableHead>
                        <TableHead>صافي الدخل</TableHead>
                        <TableHead>المستفيدون</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead className="text-center">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {disclosures.map((disclosure) => (
                        <TableRow key={disclosure.id}>
                          <TableCell className="font-medium">{disclosure.year}</TableCell>
                          <TableCell>{disclosure.waqf_name}</TableCell>
                          <TableCell className="text-success">
                            {disclosure.total_revenues.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-destructive">
                            {disclosure.total_expenses.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-info font-bold">
                            {disclosure.net_income.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <span className="font-medium">{disclosure.total_beneficiaries}</span>
                              <span className="text-muted-foreground text-xs mr-1">
                                ({disclosure.sons_count} ابن، {disclosure.daughters_count} بنت، {disclosure.wives_count} زوجة)
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(disclosure.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedDisclosure(disclosure);
                                  setViewOpen(true);
                                }}
                                className="gap-1"
                              >
                                <Eye className="h-4 w-4" />
                                عرض
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleExportPDF(disclosure)}
                                className="gap-1"
                              >
                                <Download className="h-4 w-4" />
                                PDF
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollableTableWrapper>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          {comparisonData.length > 1 ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    مقارنة الإيرادات والمصروفات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => value.toLocaleString()} />
                      <Legend />
                      <Bar dataKey="revenues" fill="hsl(var(--success))" name="الإيرادات" />
                      <Bar dataKey="expenses" fill="hsl(var(--destructive))" name="المصروفات" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    اتجاه صافي الدخل
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => value.toLocaleString()} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="netIncome" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        name="صافي الدخل"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    اتجاه عدد المستفيدين
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="beneficiaries" 
                        stroke="hsl(var(--accent))" 
                        strokeWidth={2}
                        name="عدد المستفيدين"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>جدول المقارنة التفصيلي</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollableTableWrapper>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>السنة</TableHead>
                          <TableHead>الإيرادات</TableHead>
                          <TableHead>المصروفات</TableHead>
                          <TableHead>صافي الدخل</TableHead>
                          <TableHead>المستفيدون</TableHead>
                          <TableHead>التغير %</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {comparisonData.map((data, index) => {
                          const prevYear = index > 0 ? comparisonData[index - 1] : null;
                          const change = prevYear 
                            ? ((data.netIncome - prevYear.netIncome) / prevYear.netIncome) * 100 
                            : 0;
                          
                          return (
                            <TableRow key={data.year}>
                              <TableCell className="font-medium">{data.year}</TableCell>
                              <TableCell className="text-success">
                                {data.revenues.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-destructive">
                                {data.expenses.toLocaleString()}
                              </TableCell>
                              <TableCell className="font-semibold">
                                {data.netIncome.toLocaleString()}
                              </TableCell>
                              <TableCell>{data.beneficiaries}</TableCell>
                              <TableCell>
                                {index > 0 && (
                                  <div className="flex items-center gap-1">
                                    {change > 0 ? (
                                      <TrendingUp className="h-4 w-4 text-success" />
                                    ) : (
                                      <TrendingDown className="h-4 w-4 text-destructive" />
                                    )}
                                    <span className={change > 0 ? "text-success" : "text-destructive"}>
                                      {Math.abs(change).toFixed(1)}%
                                    </span>
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </ScrollableTableWrapper>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>لا توجد بيانات كافية للمقارنة</p>
                  <p className="text-sm mt-2">يجب أن يكون هناك إفصاحان على الأقل للمقارنة</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <GenerateDisclosureDialog
        open={generateOpen}
        onOpenChange={setGenerateOpen}
      />

      <ViewDisclosureDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        disclosure={selectedDisclosure}
      />
    </div>
  );
}
