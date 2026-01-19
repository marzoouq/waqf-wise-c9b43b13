/**
 * جدول الصفوف الميتة
 * Dead Rows Table
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trash2, RefreshCw, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import type { DeadRowsInfo } from "@/services/monitoring/db-health.service";

interface DeadRowsTableProps {
  deadRows: DeadRowsInfo[];
  isLoading: boolean;
  onVacuumTable?: (tableName: string) => void;
  isVacuuming?: boolean;
}

export function DeadRowsTable({ deadRows, isLoading, onVacuumTable, isVacuuming }: DeadRowsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            الصفوف الميتة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (deadRows.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            الصفوف الميتة
          </CardTitle>
          <CardDescription>لا توجد صفوف ميتة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Trash2 className="h-12 w-12 mx-auto mb-2 text-green-500/50" />
            <p>جميع الجداول نظيفة من الصفوف الميتة</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getSeverityColor = (pct: number) => {
    if (pct >= 50) return 'text-red-500';
    if (pct >= 25) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getSeverityBadge = (pct: number) => {
    if (pct >= 50) return <Badge variant="destructive">حرج</Badge>;
    if (pct >= 25) return <Badge variant="secondary">تحذير</Badge>;
    return <Badge variant="outline">عادي</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-yellow-500" />
          الصفوف الميتة
          <Badge variant="secondary">{deadRows.length} جدول</Badge>
        </CardTitle>
        <CardDescription>
          الجداول التي تحتوي على صفوف ميتة وتحتاج لـ VACUUM
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الجدول</TableHead>
                <TableHead>الصفوف الحية</TableHead>
                <TableHead>الصفوف الميتة</TableHead>
                <TableHead>النسبة</TableHead>
                <TableHead>آخر VACUUM</TableHead>
                <TableHead>الحالة</TableHead>
                {onVacuumTable && <TableHead>إجراء</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {deadRows.map((row) => (
                <TableRow key={row.table_name}>
                  <TableCell className="font-medium">{row.table_name}</TableCell>
                  <TableCell>{row.live_rows.toLocaleString()}</TableCell>
                  <TableCell className={getSeverityColor(row.dead_pct)}>
                    {row.dead_rows.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={Math.min(row.dead_pct, 100)} 
                        className="h-2 w-16" 
                      />
                      <span className={getSeverityColor(row.dead_pct)}>
                        {row.dead_pct.toFixed(1)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {row.last_vacuum 
                      ? formatDistanceToNow(new Date(row.last_vacuum), { addSuffix: true, locale: ar })
                      : row.last_autovacuum
                        ? formatDistanceToNow(new Date(row.last_autovacuum), { addSuffix: true, locale: ar })
                        : 'لم يتم'
                    }
                  </TableCell>
                  <TableCell>{getSeverityBadge(row.dead_pct)}</TableCell>
                  {onVacuumTable && (
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onVacuumTable(row.table_name)}
                        disabled={isVacuuming}
                      >
                        <RefreshCw className="h-3 w-3 me-1" />
                        VACUUM
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
