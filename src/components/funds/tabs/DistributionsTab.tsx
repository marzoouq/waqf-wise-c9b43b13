import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, Loader2, CheckSquare, Calculator, Plus } from "lucide-react";
import { ScrollableTableWrapper } from "@/components/shared/ScrollableTableWrapper";
import { MobileScrollHint } from "@/components/shared/MobileScrollHint";
import { DistributionDetailsDialog } from "@/components/distributions/DistributionDetailsDialog";
import { ApprovalWorkflowDialog } from "@/components/distributions/ApprovalWorkflowDialog";
import { DistributionSimulator } from "@/components/distributions/DistributionSimulator";
import { useDistributions, Distribution } from "@/hooks/useDistributions";

export function DistributionsTab() {
  const { distributions, isLoading, generateDistribution } = useDistributions();
  const [selectedDistribution, setSelectedDistribution] = useState<Distribution | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [simulatorOpen, setSimulatorOpen] = useState(false);
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

  return (
    <div className="space-y-6">
      {/* زر المحاكاة */}
      <div className="flex justify-end">
        <Button onClick={() => setSimulatorOpen(true)} variant="outline" className="gap-2">
          <Calculator className="h-4 w-4" />
          محاكاة التوزيع
        </Button>
      </div>

      {/* نموذج إنشاء توزيع جديد */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">إنشاء توزيع جديد</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="period_start" className="text-xs sm:text-sm">من تاريخ</Label>
              <Input
                id="period_start"
                type="date"
                value={newDistribution.period_start}
                onChange={(e) => setNewDistribution({ ...newDistribution, period_start: e.target.value })}
                className="text-xs sm:text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="period_end" className="text-xs sm:text-sm">إلى تاريخ</Label>
              <Input
                id="period_end"
                type="date"
                value={newDistribution.period_end}
                onChange={(e) => setNewDistribution({ ...newDistribution, period_end: e.target.value })}
                className="text-xs sm:text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="waqf_corpus" className="text-xs sm:text-sm">نسبة رأس مال الوقف (%)</Label>
              <Input
                id="waqf_corpus"
                type="number"
                min="0"
                max="100"
                value={newDistribution.waqf_corpus_percentage}
                onChange={(e) => setNewDistribution({ ...newDistribution, waqf_corpus_percentage: Number(e.target.value) })}
                className="text-xs sm:text-sm"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleGenerate} 
                disabled={generating || !newDistribution.period_start || !newDistribution.period_end}
                className="w-full gap-2"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-xs sm:text-sm">جاري الإنشاء...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span className="text-xs sm:text-sm">إنشاء توزيع</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* جدول التوزيعات */}
      <Card>
        <CardHeader>
          <CardTitle>التوزيعات السابقة</CardTitle>
        </CardHeader>
        <CardContent>
          {distributions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">لا توجد توزيعات حالياً</p>
          ) : (
            <>
              <MobileScrollHint />
              <ScrollableTableWrapper>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">الشهر</TableHead>
                      <TableHead className="whitespace-nowrap hidden md:table-cell">النوع</TableHead>
                      <TableHead className="whitespace-nowrap">المبلغ</TableHead>
                      <TableHead className="whitespace-nowrap hidden sm:table-cell">المستفيدون</TableHead>
                      <TableHead className="whitespace-nowrap">الحالة</TableHead>
                      <TableHead className="whitespace-nowrap">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {distributions.map((dist) => (
                      <TableRow key={dist.id}>
                        <TableCell className="whitespace-nowrap font-medium">{dist.month}</TableCell>
                        <TableCell className="whitespace-nowrap hidden md:table-cell">{dist.distribution_type}</TableCell>
                        <TableCell className="whitespace-nowrap">{(dist.distributable_amount || 0).toLocaleString()}</TableCell>
                        <TableCell className="hidden sm:table-cell">{dist.beneficiaries_count}</TableCell>
                        <TableCell>{getStatusBadge(dist.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedDistribution(dist);
                                setDetailsOpen(true);
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedDistribution(dist);
                                setApprovalOpen(true);
                              }}
                              className="h-8 w-8 p-0"
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

      {/* Dialogs */}
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

      {/* محاكي التوزيع */}
      {simulatorOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-6xl -translate-x-1/2 -translate-y-1/2 border bg-background p-6 shadow-lg sm:rounded-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">محاكي التوزيع</h2>
              <Button variant="ghost" size="sm" onClick={() => setSimulatorOpen(false)}>
                ✕
              </Button>
            </div>
            <DistributionSimulator />
          </div>
        </div>
      )}
    </div>
  );
}
