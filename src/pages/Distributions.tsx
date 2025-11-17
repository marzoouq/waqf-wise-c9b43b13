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
import { Plus, Eye, Loader2, TrendingUp, Users, DollarSign } from "lucide-react";
import { Distribution } from "@/hooks/useDistributions";
import { ScrollableTableWrapper } from "@/components/shared/ScrollableTableWrapper";
import { MobileScrollHint } from "@/components/shared/MobileScrollHint";

export default function Distributions() {
  const { distributions, isLoading, generateDistribution } = useDistributions();
  const [selectedDistribution, setSelectedDistribution] = useState<Distribution | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 md:p-8 lg:p-10 space-y-6 md:space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gradient-primary">
              التوزيعات
            </h1>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm md:text-base">
              إدارة توزيعات الوقف
            </p>
          </div>
          <DistributionSettingsDialog />
        </div>

        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي التوزيعات</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{distributions.length}</div>
              <p className="text-xs text-muted-foreground">عدد التوزيعات المسجلة</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المبلغ الموزع</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDistributed.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">ريال سعودي</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">عدد المستفيدين</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBeneficiaries}</div>
              <p className="text-xs text-muted-foreground">إجمالي المستفيدين</p>
            </CardContent>
          </Card>
        </div>

        {/* إنشاء توزيع جديد */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              إنشاء توزيع جديد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>بداية الفترة</Label>
                <Input
                  type="date"
                  value={newDistribution.period_start}
                  onChange={(e) => setNewDistribution({ ...newDistribution, period_start: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>نهاية الفترة</Label>
                <Input
                  type="date"
                  value={newDistribution.period_end}
                  onChange={(e) => setNewDistribution({ ...newDistribution, period_end: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>نسبة رقبة الوقف (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={newDistribution.waqf_corpus_percentage}
                  onChange={(e) => setNewDistribution({ ...newDistribution, waqf_corpus_percentage: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleGenerate} disabled={generating} className="w-full">
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
            <CardTitle>التوزيعات السابقة</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الشهر</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>الفترة</TableHead>
                    <TableHead>المبلغ الموزع</TableHead>
                    <TableHead>عدد المستفيدين</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {distributions.map((distribution) => (
                    <TableRow key={distribution.id}>
                      <TableCell className="font-medium">{distribution.month}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{distribution.distribution_type || 'شهري'}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {distribution.period_start && distribution.period_end
                          ? `${new Date(distribution.period_start).toLocaleDateString('ar-SA')} - ${new Date(distribution.period_end).toLocaleDateString('ar-SA')}`
                          : '-'}
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {(distribution.distributable_amount || distribution.total_amount).toLocaleString()} ريال
                      </TableCell>
                      <TableCell>{distribution.beneficiaries_count}</TableCell>
                      <TableCell>{getStatusBadge(distribution.status)}</TableCell>
                      <TableCell>
                        {new Date(distribution.distribution_date).toLocaleDateString('ar-SA')}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedDistribution(distribution);
                            setDetailsOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <DistributionDetailsDialog
          distribution={selectedDistribution}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
        />
      </div>
    </div>
  );
}
