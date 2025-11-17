import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useDistributions } from "@/hooks/useDistributions";
import { DistributionSettingsDialog } from "@/components/distributions/DistributionSettingsDialog";
import { DistributionDetailsDialog } from "@/components/distributions/DistributionDetailsDialog";
import { ApprovalWorkflowDialog } from "@/components/distributions/ApprovalWorkflowDialog";
import { Eye, Loader2, TrendingUp, Users, DollarSign, CheckSquare } from "lucide-react";
import { Distribution } from "@/hooks/useDistributions";
import { ScrollableTableWrapper } from "@/components/shared/ScrollableTableWrapper";
import { MobileScrollHint } from "@/components/shared/MobileScrollHint";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";

export default function Distributions() {
  const { distributions, isLoading, generateDistribution } = useDistributions();
  const [selectedDistribution, setSelectedDistribution] = useState<Distribution | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  const [newDistribution, setNewDistribution] = useState({
    period_start: "",
    period_end: "",
    waqf_corpus_percentage: 0,
  });

  const handleGenerate = async () => {
    if (!newDistribution.period_start || !newDistribution.period_end) {
      return;
    }

    setGenerating(true);
    try {
      await generateDistribution(
        newDistribution.period_start,
        newDistribution.period_end,
        newDistribution.waqf_corpus_percentage
      );
      setNewDistribution({ period_start: "", period_end: "", waqf_corpus_percentage: 0 });
    } finally {
      setGenerating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      "مسودة": "secondary",
      "معتمد": "default",
      "مرفوض": "destructive",
      "معلق": "secondary",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const totalDistributed = distributions.reduce((sum, d) => sum + (d.distributable_amount || 0), 0);
  const totalBeneficiaries = distributions.reduce((sum, d) => sum + d.beneficiaries_count, 0);

  return (
    <MobileOptimizedLayout>
      <MobileOptimizedHeader
        title="التوزيعات"
        description="إدارة توزيعات الوقف"
        actions={<DistributionSettingsDialog />}
      />

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">إجمالي التوزيعات</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{distributions.length}</div>
            <p className="text-xs text-muted-foreground">عدد التوزيعات المسجلة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">المبلغ الموزع</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalDistributed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">ريال سعودي</p>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">المستفيدون</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalBeneficiaries}</div>
            <p className="text-xs text-muted-foreground">إجمالي المستفيدين</p>
          </CardContent>
        </Card>
      </div>

      {/* نموذج إنشاء توزيع جديد */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">إنشاء توزيع جديد</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="period_start" className="text-xs sm:text-sm">تاريخ بداية الفترة</Label>
              <Input
                id="period_start"
                type="date"
                value={newDistribution.period_start}
                onChange={(e) => setNewDistribution({ ...newDistribution, period_start: e.target.value })}
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="period_end" className="text-xs sm:text-sm">تاريخ نهاية الفترة</Label>
              <Input
                id="period_end"
                type="date"
                value={newDistribution.period_end}
                onChange={(e) => setNewDistribution({ ...newDistribution, period_end: e.target.value })}
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="waqf_corpus" className="text-xs sm:text-sm">نسبة رقبة الوقف (%)</Label>
              <Input
                id="waqf_corpus"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={newDistribution.waqf_corpus_percentage}
                onChange={(e) => setNewDistribution({ ...newDistribution, waqf_corpus_percentage: parseFloat(e.target.value) || 0 })}
                className="text-sm"
              />
            </div>
            <div className="flex items-end sm:col-span-2 lg:col-span-1">
              <Button onClick={handleGenerate} disabled={generating} className="w-full text-sm">
                {generating ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري الإنشاء...
                  </>
                ) : (
                  "إنشاء التوزيع"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* قائمة التوزيعات */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">التوزيعات السابقة</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : distributions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">لا توجد توزيعات حالياً</p>
            </div>
          ) : (
            <>
              <MobileScrollHint />
              <ScrollableTableWrapper>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm whitespace-nowrap">الشهر</TableHead>
                      <TableHead className="text-xs sm:text-sm whitespace-nowrap">النوع</TableHead>
                      <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">الفترة</TableHead>
                      <TableHead className="text-xs sm:text-sm whitespace-nowrap">المبلغ</TableHead>
                      <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden sm:table-cell">المستفيدون</TableHead>
                      <TableHead className="text-xs sm:text-sm whitespace-nowrap">الحالة</TableHead>
                      <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden lg:table-cell">التاريخ</TableHead>
                      <TableHead className="text-xs sm:text-sm whitespace-nowrap">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {distributions.map((distribution) => (
                      <TableRow key={distribution.id}>
                        <TableCell className="font-medium text-xs sm:text-sm whitespace-nowrap">{distribution.month}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{distribution.distribution_type || 'شهري'}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden md:table-cell">
                          {distribution.period_start && distribution.period_end
                            ? `${new Date(distribution.period_start).toLocaleDateString('ar-SA')} - ${new Date(distribution.period_end).toLocaleDateString('ar-SA')}`
                            : '-'}
                        </TableCell>
                        <TableCell className="font-semibold text-green-600 text-xs sm:text-sm whitespace-nowrap">
                          {(distribution.distributable_amount || distribution.total_amount).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm hidden sm:table-cell">{distribution.beneficiaries_count}</TableCell>
                        <TableCell>{getStatusBadge(distribution.status)}</TableCell>
                        <TableCell className="text-xs sm:text-sm hidden lg:table-cell whitespace-nowrap">
                          {new Date(distribution.distribution_date).toLocaleDateString('ar-SA')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedDistribution(distribution);
                                setDetailsOpen(true);
                              }}
                              className="h-8 w-8 p-0"
                              title="عرض التفاصيل"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedDistribution(distribution);
                                setApprovalOpen(true);
                              }}
                              className="h-8 w-8 p-0"
                              title="الموافقات"
                            >
                              <CheckSquare className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollableTableWrapper>
            </>
          )}
        </CardContent>
      </Card>

      <DistributionDetailsDialog
        distribution={selectedDistribution}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
      
      <ApprovalWorkflowDialog
        distribution={selectedDistribution}
        open={approvalOpen}
        onOpenChange={setApprovalOpen}
      />
    </MobileOptimizedLayout>
  );
}
