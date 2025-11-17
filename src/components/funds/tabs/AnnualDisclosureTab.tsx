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
} from "lucide-react";
import { useAnnualDisclosures } from "@/hooks/useAnnualDisclosures";
import { GenerateDisclosureDialog } from "@/components/distributions/GenerateDisclosureDialog";
import { ViewDisclosureDialog } from "@/components/distributions/ViewDisclosureDialog";
import { generateDisclosurePDF } from "@/lib/generateDisclosurePDF";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

export function AnnualDisclosureTab() {
  const { disclosures, currentYearDisclosure, isLoading, publishDisclosure } = useAnnualDisclosures();
  const [selectedDisclosure, setSelectedDisclosure] = useState<any>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // بيانات المقارنة السنوية
  const comparisonData = disclosures.slice(0, 5).reverse().map(d => ({
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

  const handleExportPDF = async (disclosure: any) => {
    try {
      // جلب المستفيدين إذا كانوا متوفرين
      const { data: beneficiaries } = await supabase
        .from("disclosure_beneficiaries")
        .select("*")
        .eq("disclosure_id", disclosure.id);
      
      await generateDisclosurePDF(disclosure, beneficiaries || []);
    } catch (error) {
      console.error("Error exporting PDF:", error);
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
          {/* الإفصاح للسنة الحالية */}
      {currentYearDisclosure && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                الإفصاح السنوي - {currentYearDisclosure.year}
              </CardTitle>
              {getStatusBadge(currentYearDisclosure.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold text-green-600">
                  {currentYearDisclosure.total_revenues.toLocaleString()} ر.س
                </p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">إجمالي المصروفات</p>
                <p className="text-2xl font-bold text-red-600">
                  {currentYearDisclosure.total_expenses.toLocaleString()} ر.س
                </p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">صافي الدخل</p>
                <p className="text-2xl font-bold text-blue-600">
                  {currentYearDisclosure.net_income.toLocaleString()} ر.س
                </p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">عدد المستفيدين</p>
                <p className="text-2xl font-bold">
                  {currentYearDisclosure.total_beneficiaries}
                </p>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">الأبناء</p>
                <p className="text-xl font-bold">{currentYearDisclosure.sons_count}</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">البنات</p>
                <p className="text-xl font-bold">{currentYearDisclosure.daughters_count}</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">الزوجات</p>
                <p className="text-xl font-bold">{currentYearDisclosure.wives_count}</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">الإجمالي</p>
                <p className="text-xl font-bold">{currentYearDisclosure.total_beneficiaries}</p>
              </div>
            </div>

            <Separator className="my-4" />

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

            <div className="flex gap-2 mt-4">
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
      )}

      {/* الإجراءات */}
      <div className="flex justify-end">
        <Button onClick={() => setGenerateOpen(true)} className="gap-2">
          <FileText className="h-4 w-4" />
          إنشاء إفصاح سنة جديدة
        </Button>
      </div>

      {/* جدول الإفصاحات السابقة */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">الإفصاحات السنوية السابقة</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollableTableWrapper>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>السنة</TableHead>
                  <TableHead>اسم الوقف</TableHead>
                  <TableHead>إجمالي الإيرادات</TableHead>
                  <TableHead>إجمالي المصروفات</TableHead>
                  <TableHead>صافي الدخل</TableHead>
                  <TableHead>المستفيدون</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      جاري التحميل...
                    </TableCell>
                  </TableRow>
                ) : disclosures.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      لا توجد إفصاحات سنوية
                    </TableCell>
                  </TableRow>
                ) : (
                  disclosures.map((disclosure) => (
                    <TableRow key={disclosure.id}>
                      <TableCell className="font-medium">{disclosure.year}</TableCell>
                      <TableCell>{disclosure.waqf_name}</TableCell>
                      <TableCell className="text-green-600">
                        {disclosure.total_revenues.toLocaleString()} ر.س
                      </TableCell>
                      <TableCell className="text-red-600">
                        {disclosure.total_expenses.toLocaleString()} ر.س
                      </TableCell>
                      <TableCell className="text-blue-600 font-bold">
                        {disclosure.net_income.toLocaleString()} ر.س
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
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollableTableWrapper>
        </CardContent>
      </Card>

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
