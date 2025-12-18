/**
 * جدول أداء الجداول
 * Tables Performance Table
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import type { TableScanStats } from "@/services/monitoring/db-performance.service";

interface TablesPerformanceTableProps {
  tables: TableScanStats[];
  isLoading: boolean;
}

export function TablesPerformanceTable({ tables, isLoading }: TablesPerformanceTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-1" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getStatusBadge = (pct: number) => {
    if (pct >= 90) return (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="w-3 h-3" />
        حرج
      </Badge>
    );
    if (pct >= 70) return (
      <Badge variant="outline" className="gap-1 border-warning text-warning">
        <AlertTriangle className="w-3 h-3" />
        تحذير
      </Badge>
    );
    return (
      <Badge variant="outline" className="gap-1 border-success text-success">
        <CheckCircle className="w-3 h-3" />
        جيد
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">الجداول الأكثر استخداماً</CardTitle>
        <CardDescription>
          تفاصيل Sequential Scans و Index Scans لكل جدول
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الجدول</TableHead>
                <TableHead className="text-right">Seq Scan</TableHead>
                <TableHead className="text-right">Idx Scan</TableHead>
                <TableHead className="text-right">نسبة Seq</TableHead>
                <TableHead className="text-right">Dead Rows</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tables.slice(0, 15).map((table) => (
                <TableRow key={table.table_name}>
                  <TableCell className="font-mono text-sm">
                    {table.table_name.replace('public.', '')}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatNumber(table.seq_scan)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatNumber(table.idx_scan)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            table.seq_pct >= 90 ? 'bg-destructive' :
                            table.seq_pct >= 70 ? 'bg-warning' : 'bg-success'
                          }`}
                          style={{ width: `${Math.min(table.seq_pct, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm">{table.seq_pct.toFixed(1)}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={table.dead_rows > 100 ? 'text-warning font-medium' : ''}>
                      {formatNumber(table.dead_rows)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(table.seq_pct)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {tables.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            لا توجد بيانات متاحة
          </div>
        )}
      </CardContent>
    </Card>
  );
}
