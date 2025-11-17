import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, CheckSquare, Calculator, Plus } from "lucide-react";
import { ScrollableTableWrapper } from "@/components/shared/ScrollableTableWrapper";
import { MobileScrollHint } from "@/components/shared/MobileScrollHint";
import { DistributionDetailsDialog } from "@/components/distributions/DistributionDetailsDialog";
import { ApprovalWorkflowDialog } from "@/components/distributions/ApprovalWorkflowDialog";
import { DistributionSimulator } from "@/components/distributions/DistributionSimulator";
import { CreateDistributionDialog } from "@/components/distributions/CreateDistributionDialog";
import { useDistributions, Distribution } from "@/hooks/useDistributions";

export function DistributionsTab() {
  const { distributions, isLoading } = useDistributions();
  const [selectedDistribution, setSelectedDistribution] = useState<Distribution | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

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
      {/* أزرار الإجراءات */}
      <div className="flex flex-wrap gap-3 justify-end">
        <Button onClick={() => setSimulatorOpen(true)} variant="outline" className="gap-2">
          <Calculator className="h-4 w-4" />
          محاكاة التوزيع
        </Button>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          إنشاء توزيع جديد
        </Button>
      </div>

      {/* جدول التوزيعات السابقة */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">التوزيعات السابقة</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollableTableWrapper>
            <MobileScrollHint />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">الشهر</TableHead>
                  <TableHead className="text-xs sm:text-sm">إجمالي المبلغ</TableHead>
                  <TableHead className="text-xs sm:text-sm">عدد المستفيدين</TableHead>
                  <TableHead className="text-xs sm:text-sm">الحالة</TableHead>
                  <TableHead className="text-xs sm:text-sm text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-xs sm:text-sm">
                      جاري التحميل...
                    </TableCell>
                  </TableRow>
                ) : distributions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-xs sm:text-sm text-muted-foreground">
                      لا توجد توزيعات
                    </TableCell>
                  </TableRow>
                ) : (
                  distributions.map((distribution) => (
                    <TableRow key={distribution.id}>
                      <TableCell className="font-medium text-xs sm:text-sm">
                        {distribution.month}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        {distribution.total_amount?.toLocaleString()} ر.س
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        {distribution.beneficiaries_count}
                      </TableCell>
                      <TableCell>{getStatusBadge(distribution.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedDistribution(distribution);
                              setDetailsOpen(true);
                            }}
                            className="gap-1 text-xs"
                          >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">التفاصيل</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedDistribution(distribution);
                              setApprovalOpen(true);
                            }}
                            className="gap-1 text-xs"
                          >
                            <CheckSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">الموافقات</span>
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

      <DistributionDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        distribution={selectedDistribution}
      />

      <ApprovalWorkflowDialog
        open={approvalOpen}
        onOpenChange={setApprovalOpen}
        distribution={selectedDistribution}
      />

      <DistributionSimulator
        open={simulatorOpen}
        onOpenChange={setSimulatorOpen}
      />

      <CreateDistributionDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </div>
  );
}
