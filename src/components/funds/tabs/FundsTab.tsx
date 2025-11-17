import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollableTableWrapper } from "@/components/shared/ScrollableTableWrapper";
import { MobileScrollHint } from "@/components/shared/MobileScrollHint";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingState } from "@/components/shared/LoadingState";
import { Wallet } from "lucide-react";

interface FundsTabProps {
  funds: any[];
  isLoading: boolean;
}

export function FundsTab({ funds, isLoading }: FundsTabProps) {
  if (isLoading) {
    return <LoadingState message="جاري تحميل أقلام الوقف..." />;
  }

  if (funds.length === 0) {
    return (
      <EmptyState
        icon={Wallet}
        title="لا توجد أقلام وقف"
        description="ابدأ بإضافة قلم وقف جديد"
      />
    );
  }

  const getStatusBadge = (percentage: number) => {
    if (percentage >= 80) return <Badge variant="destructive">مرتفع</Badge>;
    if (percentage >= 50) return <Badge className="bg-yellow-500">متوسط</Badge>;
    return <Badge variant="default">جيد</Badge>;
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle>أقلام الوقف</CardTitle>
      </CardHeader>
      <CardContent>
        <MobileScrollHint />
        <ScrollableTableWrapper>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">اسم القلم</TableHead>
                <TableHead className="whitespace-nowrap">المخصص</TableHead>
                <TableHead className="whitespace-nowrap">المصروف</TableHead>
                <TableHead className="whitespace-nowrap">المتبقي</TableHead>
                <TableHead className="whitespace-nowrap hidden sm:table-cell">المستفيدون</TableHead>
                <TableHead className="whitespace-nowrap hidden md:table-cell">النسبة</TableHead>
                <TableHead className="whitespace-nowrap">الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {funds.map((fund: any) => {
                const remaining = Number(fund.allocated_amount) - Number(fund.spent_amount);
                const percentage = (Number(fund.spent_amount) / Number(fund.allocated_amount)) * 100;

                return (
                  <TableRow key={fund.id}>
                    <TableCell className="font-medium whitespace-nowrap">{fund.name}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {Number(fund.allocated_amount).toLocaleString()} ر.س
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {Number(fund.spent_amount).toLocaleString()} ر.س
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {remaining.toLocaleString()} ر.س
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{fund.beneficiaries_count}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <Progress value={percentage} className="w-20" />
                        <span className="text-xs">{percentage.toFixed(0)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(percentage)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollableTableWrapper>
      </CardContent>
    </Card>
  );
}
