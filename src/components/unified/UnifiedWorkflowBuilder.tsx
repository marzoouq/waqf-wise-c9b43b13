import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, ArrowRight, Save, CheckCircle, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useApprovalWorkflows } from '@/hooks/useApprovalWorkflows';
import { ROLE_LABELS, WORKFLOW_ROLES, ENTITY_TYPE_LABELS } from '@/lib/role-labels';

/**
 * UnifiedWorkflowBuilder - مكون موحد لإدارة مسارات الموافقات
 * يجمع بين عرض المسارات من قاعدة البيانات وإنشاء مسارات جديدة
 */

interface ApprovalLevel {
  id: string;
  level: number;
  role: string;
  canSkip?: boolean;
  required?: boolean;
  autoEscalateAfter?: number;
  conditions?: {
    minAmount?: number;
    maxAmount?: number;
  };
}

interface WorkflowConfig {
  id: string;
  name: string;
  entityType: string;
  levels: ApprovalLevel[];
  isActive: boolean;
}

export function UnifiedWorkflowBuilder() {
  const { toast } = useToast();
  const { workflows: dbWorkflows, isLoading } = useApprovalWorkflows();
  const [editingWorkflow, setEditingWorkflow] = useState<WorkflowConfig | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const roles = WORKFLOW_ROLES.map(role => ({
    value: role,
    label: ROLE_LABELS[role],
  }));

  const startNew = () => {
    setEditingWorkflow({
      id: `workflow_${Date.now()}`,
      name: '',
      entityType: 'distribution',
      isActive: true,
      levels: [{ id: '1', level: 1, role: '', canSkip: false, required: true }],
    });
    setIsCreating(true);
  };

  const addLevel = () => {
    if (!editingWorkflow) return;
    const newLevel: ApprovalLevel = {
      id: `${editingWorkflow.levels.length + 1}`,
      level: editingWorkflow.levels.length + 1,
      role: '',
      canSkip: false,
      required: true,
    };
    setEditingWorkflow({
      ...editingWorkflow,
      levels: [...editingWorkflow.levels, newLevel],
    });
  };

  const removeLevel = (levelId: string) => {
    if (!editingWorkflow) return;
    const updatedLevels = editingWorkflow.levels
      .filter(l => l.id !== levelId)
      .map((l, index) => ({ ...l, level: index + 1 }));
    setEditingWorkflow({
      ...editingWorkflow,
      levels: updatedLevels,
    });
  };

  const updateLevel = (levelId: string, updates: Partial<ApprovalLevel>) => {
    if (!editingWorkflow) return;
    setEditingWorkflow({
      ...editingWorkflow,
      levels: editingWorkflow.levels.map(l =>
        l.id === levelId ? { ...l, ...updates } : l
      ),
    });
  };

  const saveWorkflow = async () => {
    if (!editingWorkflow) return;

    if (!editingWorkflow.name || editingWorkflow.levels.some(l => !l.role)) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول المطلوبة',
        variant: 'destructive',
      });
      return;
    }

    // TODO: حفظ في قاعدة البيانات عبر mutation
    toast({
      title: 'تم الحفظ',
      description: 'تم حفظ مسار الموافقات بنجاح',
    });
    setIsCreating(false);
    setEditingWorkflow(null);
  };

  // عرض نموذج الإنشاء/التعديل
  if (isCreating && editingWorkflow) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">بناء مسار موافقات</h3>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => {
              setIsCreating(false);
              setEditingWorkflow(null);
            }}>
              إلغاء
            </Button>
            <Button onClick={saveWorkflow}>
              <Save className="h-4 w-4 ml-2" />
              حفظ المسار
            </Button>
          </div>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="workflow-name">اسم المسار</Label>
              <Input
                id="workflow-name"
                value={editingWorkflow.name}
                onChange={e =>
                  setEditingWorkflow({ ...editingWorkflow, name: e.target.value })
                }
                placeholder="مثال: مسار التوزيعات الكبيرة"
              />
            </div>

            <div>
              <Label htmlFor="entity-type">نوع العملية</Label>
              <Select
                value={editingWorkflow.entityType}
                onValueChange={entityType =>
                  setEditingWorkflow({ ...editingWorkflow, entityType })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ENTITY_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="active">حالة المسار</Label>
                <p className="text-sm text-muted-foreground">
                  {editingWorkflow.isActive ? 'نشط' : 'معطل'}
                </p>
              </div>
              <Switch
                id="active"
                checked={editingWorkflow.isActive}
                onCheckedChange={isActive =>
                  setEditingWorkflow({ ...editingWorkflow, isActive })
                }
              />
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">مستويات الموافقة</h4>
            <Button onClick={addLevel} size="sm">
              <Plus className="h-4 w-4 ml-2" />
              إضافة مستوى
            </Button>
          </div>

          {editingWorkflow.levels.map((level, index) => (
            <Card key={level.id} className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge>المستوى {level.level}</Badge>
                  {editingWorkflow.levels.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLevel(level.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>الدور المطلوب</Label>
                    <Select
                      value={level.role}
                      onValueChange={role => updateLevel(level.id, { role })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الدور" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map(role => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor={`escalate-${level.id}`}>
                      التصعيد التلقائي (ساعات)
                    </Label>
                    <Input
                      id={`escalate-${level.id}`}
                      type="number"
                      min="0"
                      value={level.autoEscalateAfter || ''}
                      onChange={e =>
                        updateLevel(level.id, {
                          autoEscalateAfter: Number(e.target.value) || undefined,
                        })
                      }
                      placeholder="مثال: 24"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`skip-${level.id}`}
                      checked={level.canSkip || false}
                      onCheckedChange={canSkip => updateLevel(level.id, { canSkip })}
                    />
                    <Label htmlFor={`skip-${level.id}`}>يمكن تخطي هذا المستوى</Label>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor={`min-${level.id}`}>الحد الأدنى للمبلغ</Label>
                    <Input
                      id={`min-${level.id}`}
                      type="number"
                      value={level.conditions?.minAmount || ''}
                      onChange={e =>
                        updateLevel(level.id, {
                          conditions: {
                            ...level.conditions,
                            minAmount: Number(e.target.value) || undefined,
                          },
                        })
                      }
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`max-${level.id}`}>الحد الأقصى للمبلغ</Label>
                    <Input
                      id={`max-${level.id}`}
                      type="number"
                      value={level.conditions?.maxAmount || ''}
                      onChange={e =>
                        updateLevel(level.id, {
                          conditions: {
                            ...level.conditions,
                            maxAmount: Number(e.target.value) || undefined,
                          },
                        })
                      }
                      placeholder="غير محدود"
                    />
                  </div>
                </div>
              </div>

              {index < editingWorkflow.levels.length - 1 && (
                <div className="flex justify-center mt-4">
                  <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90" />
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // عرض قائمة المسارات من قاعدة البيانات
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
              إدارة مسارات الموافقات المتعددة المستويات
            </CardDescription>
          </div>
          <Button onClick={startNew}>
            <Plus className="h-4 w-4 ml-2" />
            مسار جديد
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {dbWorkflows.map((workflow) => (
            <Card key={workflow.id} className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-base">{workflow.workflow_name}</CardTitle>
                      <Badge variant={workflow.is_active ? 'default' : 'secondary'}>
                        {workflow.is_active ? 'نشط' : 'متوقف'}
                      </Badge>
                      <Badge variant="outline">
                        {ENTITY_TYPE_LABELS[workflow.entity_type] || workflow.entity_type}
                      </Badge>
                    </div>
                    {workflow.conditions && Object.keys(workflow.conditions).length > 0 && (
                      <CardDescription className="text-sm">
                        {workflow.conditions.min_amount && `من ${workflow.conditions.min_amount} ريال`}
                        {workflow.conditions.max_amount && ` - إلى ${workflow.conditions.max_amount} ريال`}
                      </CardDescription>
                    )}
                  </div>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
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
                        <div className="font-medium text-sm text-center">
                          {ROLE_LABELS[level.role as keyof typeof ROLE_LABELS] || level.role}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {level.required ? 'مطلوب' : 'اختياري'}
                        </div>
                      </div>
                      {idx < workflow.approval_levels.length - 1 && (
                        <ArrowRight className="text-muted-foreground h-5 w-5" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {dbWorkflows.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              لا توجد مسارات موافقات. انقر على "مسار جديد" للبدء.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
