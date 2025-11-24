import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useApprovalWorkflows } from '@/hooks/useApprovalWorkflows';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const entityTypeLabels: Record<string, string> = {
  journal_entry: 'قيد محاسبي',
  distribution: 'توزيع غلة',
  payment: 'دفع مستحقات',
  loan: 'قرض',
};

const roleLabels: Record<string, string> = {
  accountant: 'المحاسب',
  manager: 'المدير',
  nazer: 'الناظر',
  finance: 'الموظف المالي',
};

export function ApprovalWorkflowBuilder() {
  const { workflows, isLoading } = useApprovalWorkflows();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">جاري التحميل...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              مسارات الموافقات
            </CardTitle>
            <CardDescription>
              إدارة مسارات الموافقات المتعددة المستويات للعمليات المحاسبية
            </CardDescription>
          </div>
          <Button>
            <Plus className="h-4 w-4 ml-2" />
            مسار جديد
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {workflows.map((workflow) => (
            <Card key={workflow.id} className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{workflow.workflow_name}</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      <Badge variant="outline">
                        {entityTypeLabels[workflow.entity_type] || workflow.entity_type}
                      </Badge>
                      {workflow.conditions && Object.keys(workflow.conditions).length > 0 && (
                        <span className="mr-2 text-xs">
                          {workflow.conditions.min_amount && `من ${workflow.conditions.min_amount} ريال`}
                          {workflow.conditions.max_amount && `إلى ${workflow.conditions.max_amount} ريال`}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <Badge variant={workflow.is_active ? 'default' : 'secondary'}>
                    {workflow.is_active ? 'نشط' : 'متوقف'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {workflow.approval_levels.map((level, idx) => (
                    <div key={idx} className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex flex-col items-center gap-1 p-3 bg-muted rounded-lg min-w-[120px]">
                        <Badge variant="outline" className="mb-1">
                          المستوى {level.level}
                        </Badge>
                        <div className="font-medium text-sm">
                          {roleLabels[level.role] || level.role}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {level.required ? 'مطلوب' : 'اختياري'}
                        </div>
                      </div>
                      {idx < workflow.approval_levels.length - 1 && (
                        <div className="text-muted-foreground">→</div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {workflows.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              لا توجد مسارات موافقات. انقر على "مسار جديد" للبدء.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
