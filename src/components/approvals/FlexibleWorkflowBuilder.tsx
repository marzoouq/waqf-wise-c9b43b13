import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, ArrowRight, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApprovalLevel {
  id: string;
  level: number;
  role: string;
  canSkip: boolean;
  parallelApprovers?: string[];
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

export function FlexibleWorkflowBuilder() {
  const { toast } = useToast();
  const [workflows, setWorkflows] = useState<WorkflowConfig[]>([
    {
      id: 'standard',
      name: 'مسار قياسي',
      entityType: 'distribution',
      isActive: true,
      levels: [
        { id: '1', level: 1, role: 'accountant', canSkip: false },
        { id: '2', level: 2, role: 'nazer', canSkip: false },
        { id: '3', level: 3, role: 'executor', canSkip: false },
      ],
    },
  ]);
  const [editingWorkflow, setEditingWorkflow] = useState<WorkflowConfig | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const roles = [
    { value: 'reviewer', label: 'مراجع' },
    { value: 'accountant', label: 'محاسب' },
    { value: 'nazer', label: 'ناظر' },
    { value: 'financial_manager', label: 'مدير مالي' },
    { value: 'executor', label: 'منفذ' },
  ];

  const startNew = () => {
    setEditingWorkflow({
      id: `workflow_${Date.now()}`,
      name: '',
      entityType: 'distribution',
      isActive: true,
      levels: [{ id: '1', level: 1, role: '', canSkip: false }],
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

  const saveWorkflow = () => {
    if (!editingWorkflow) return;

    if (!editingWorkflow.name || editingWorkflow.levels.some(l => !l.role)) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول المطلوبة',
        variant: 'destructive',
      });
      return;
    }

    const updatedWorkflows = workflows.find(w => w.id === editingWorkflow.id)
      ? workflows.map(w => (w.id === editingWorkflow.id ? editingWorkflow : w))
      : [...workflows, editingWorkflow];

    setWorkflows(updatedWorkflows);
    toast({
      title: 'تم الحفظ',
      description: 'تم حفظ مسار الموافقات بنجاح',
    });
    setIsCreating(false);
    setEditingWorkflow(null);
  };

  const deleteWorkflow = (id: string) => {
    setWorkflows(workflows.filter(w => w.id !== id));
    toast({
      title: 'تم الحذف',
      description: 'تم حذف مسار الموافقات',
    });
  };

  if (isCreating && editingWorkflow) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">بناء مسار موافقات مخصص</h3>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsCreating(false)}>
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
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>الدور</Label>
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
                      checked={level.canSkip}
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">مسارات الموافقات</h3>
        <Button onClick={startNew}>
          <Plus className="h-4 w-4 ml-2" />
          مسار جديد
        </Button>
      </div>

      <div className="grid gap-4">
        {workflows.map(workflow => (
          <Card key={workflow.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold">{workflow.name}</h4>
                  <Badge variant={workflow.isActive ? 'default' : 'secondary'}>
                    {workflow.isActive ? 'نشط' : 'معطل'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {workflow.levels.length} مستوى موافقة
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {workflow.levels.map((level, index) => (
                    <div key={level.id} className="flex items-center gap-1">
                      <Badge variant="outline">
                        {roles.find(r => r.value === level.role)?.label || level.role}
                      </Badge>
                      {index < workflow.levels.length - 1 && (
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingWorkflow(workflow);
                    setIsCreating(true);
                  }}
                >
                  تعديل
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteWorkflow(workflow.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
