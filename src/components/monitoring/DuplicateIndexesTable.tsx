/**
 * جدول الفهارس المكررة
 * Duplicate Indexes Table
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Layers, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { DuplicateIndex } from "@/services/monitoring/db-health.service";

interface DuplicateIndexesTableProps {
  indexes: DuplicateIndex[];
  isLoading: boolean;
}

export function DuplicateIndexesTable({ indexes, isLoading }: DuplicateIndexesTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            الفهارس المكررة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (indexes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-green-500" />
            الفهارس المكررة
          </CardTitle>
          <CardDescription>لا توجد فهارس مكررة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Layers className="h-12 w-12 mx-auto mb-2 text-green-500/50" />
            <p>جميع الفهارس فريدة وليست مكررة</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          الفهارس المكررة
          <Badge variant="secondary">{indexes.length}</Badge>
        </CardTitle>
        <CardDescription>
          هذه الفهارس مكررة ويمكن حذف أحدها لتحسين الأداء
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الجدول</TableHead>
                <TableHead>الفهرس 1</TableHead>
                <TableHead>الفهرس 2</TableHead>
                <TableHead>الأعمدة</TableHead>
                <TableHead>الحجم</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {indexes.map((idx, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{idx.table_name}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      {idx.index1}
                    </code>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      {idx.index2}
                    </code>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={idx.column_definition}>
                    {idx.column_definition}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 text-xs">
                      <span>{idx.index1_size}</span>
                      <span>/</span>
                      <span>{idx.index2_size}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
