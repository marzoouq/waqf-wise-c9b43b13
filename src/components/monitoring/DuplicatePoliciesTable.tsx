/**
 * جدول سياسات RLS المكررة
 * Duplicate RLS Policies Table
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { DuplicatePolicy } from "@/services/monitoring/db-health.service";

interface DuplicatePoliciesTableProps {
  policies: DuplicatePolicy[];
  isLoading: boolean;
}

export function DuplicatePoliciesTable({ policies, isLoading }: DuplicatePoliciesTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            سياسات RLS المكررة
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

  if (policies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-500" />
            سياسات RLS المكررة
          </CardTitle>
          <CardDescription>لا توجد سياسات مكررة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-2 text-green-500/50" />
            <p>جميع سياسات RLS فريدة وليست مكررة</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getCommandBadge = (cmd: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      SELECT: 'default',
      INSERT: 'secondary',
      UPDATE: 'outline',
      DELETE: 'destructive',
    };
    return <Badge variant={variants[cmd] || 'default'}>{cmd}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          سياسات RLS المكررة
          <Badge variant="secondary">{policies.length}</Badge>
        </CardTitle>
        <CardDescription>
          هذه السياسات لها نفس الشروط ويمكن دمجها في سياسة واحدة
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الجدول</TableHead>
                <TableHead>العملية</TableHead>
                <TableHead>السياسة 1</TableHead>
                <TableHead>السياسة 2</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policies.map((policy, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{policy.table_name}</TableCell>
                  <TableCell>{getCommandBadge(policy.command)}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      {policy.policy1}
                    </code>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      {policy.policy2}
                    </code>
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
