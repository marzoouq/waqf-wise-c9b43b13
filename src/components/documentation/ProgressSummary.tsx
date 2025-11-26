import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhaseProgress {
  phase_number: number;
  phase_name: string;
  category: string;
  status: string;
  completion_percentage: number;
  completed_tasks: number;
  total_tasks: number;
}

interface ProgressSummaryProps {
  phases: PhaseProgress[];
}

export function ProgressSummary({ phases }: ProgressSummaryProps) {
  // حساب الإحصائيات الإجمالية
  const corePhases = phases.filter(p => p.category === 'core');
  const designPhases = phases.filter(p => p.category === 'design');
  const testingPhases = phases.filter(p => p.category === 'testing');
  const futurePhases = phases.filter(p => p.category === 'future');

  const totalCompleted = phases.filter(p => p.completion_percentage === 100).length;
  const totalInProgress = phases.filter(p => p.completion_percentage > 0 && p.completion_percentage < 100).length;
  const totalPlanned = phases.filter(p => p.completion_percentage === 0).length;

  const overallProgress = phases.length > 0
    ? Math.round(phases.reduce((sum, p) => sum + p.completion_percentage, 0) / phases.length)
    : 0;

  const getStatusIcon = (percentage: number) => {
    if (percentage === 100) return <CheckCircle2 className="h-4 w-4 text-success" />;
    if (percentage > 0) return <Clock className="h-4 w-4 text-warning" />;
    return <Circle className="h-4 w-4 text-muted-foreground" />;
  };

  const getStatusBadge = (percentage: number) => {
    if (percentage === 100) return <Badge className="bg-success/10 text-success border-success/20">مكتمل</Badge>;
    if (percentage > 0) return <Badge className="bg-warning/10 text-warning border-warning/20">قيد التنفيذ</Badge>;
    return <Badge variant="secondary">مخطط</Badge>;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'core':
        return 'bg-primary/10 border-primary/20 text-primary';
      case 'design':
        return 'bg-purple-500/10 border-purple-500/20 text-purple-600';
      case 'testing':
        return 'bg-orange-500/10 border-orange-500/20 text-orange-600';
      case 'future':
        return 'bg-gray-500/10 border-gray-500/20 text-gray-600';
      default:
        return 'bg-muted border-border text-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* نظرة عامة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">التقدم الإجمالي</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{overallProgress}%</div>
            <Progress value={overallProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">مراحل مكتملة</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{totalCompleted}</div>
            <p className="text-xs text-muted-foreground mt-1">
              من أصل {phases.length} مرحلة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">قيد التنفيذ</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">{totalInProgress}</div>
            <p className="text-xs text-muted-foreground mt-1">
              مرحلة نشطة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">مراحل مخططة</CardTitle>
            <Circle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalPlanned}</div>
            <p className="text-xs text-muted-foreground mt-1">
              للمستقبل
            </p>
          </CardContent>
        </Card>
      </div>

      {/* المراحل حسب الفئة */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* المراحل الأساسية */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary" />
              المراحل الأساسية
              <Badge variant="outline">{corePhases.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {corePhases.slice(0, 10).map((phase) => (
              <div key={`${phase.phase_number}-${phase.phase_name}`} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {getStatusIcon(phase.completion_percentage)}
                    <span className="text-sm font-medium truncate">
                      {phase.phase_name}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-primary mr-2">
                    {phase.completion_percentage}%
                  </span>
                </div>
                <Progress value={phase.completion_percentage} className="h-1.5" />
              </div>
            ))}
            {corePhases.length > 10 && (
              <p className="text-sm text-muted-foreground text-center pt-2">
                و {corePhases.length - 10} مراحل أخرى...
              </p>
            )}
          </CardContent>
        </Card>

        {/* المراحل التصميمية */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-purple-500" />
              المراحل التصميمية
              <Badge variant="outline">{designPhases.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {designPhases.map((phase) => (
              <div key={`${phase.phase_number}-${phase.phase_name}`} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {getStatusIcon(phase.completion_percentage)}
                    <span className="text-sm font-medium truncate">
                      {phase.phase_name}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-purple-600 mr-2">
                    {phase.completion_percentage}%
                  </span>
                </div>
                <Progress value={phase.completion_percentage} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* مراحل الاختبار */}
        {testingPhases.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-orange-500" />
                مراحل الاختبار
                <Badge variant="outline">{testingPhases.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {testingPhases.map((phase) => (
                <div key={`${phase.phase_number}-${phase.phase_name}`} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {getStatusIcon(phase.completion_percentage)}
                      <span className="text-sm font-medium truncate">
                        {phase.phase_name}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-orange-600 mr-2">
                      {phase.completion_percentage}%
                    </span>
                  </div>
                  <Progress value={phase.completion_percentage} className="h-1.5" />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* المراحل المستقبلية */}
        {futurePhases.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-gray-500" />
                المراحل المستقبلية
                <Badge variant="outline">{futurePhases.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {futurePhases.map((phase) => (
                <div key={`${phase.phase_number}-${phase.phase_name}`} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {getStatusIcon(phase.completion_percentage)}
                      <span className="text-sm font-medium truncate">
                        {phase.phase_name}
                      </span>
                    </div>
                    {getStatusBadge(phase.completion_percentage)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* إحصائيات المهام */}
      <Card>
        <CardHeader>
          <CardTitle>إحصائيات المهام</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">إجمالي المهام</p>
              <p className="text-2xl font-bold">
                {phases.reduce((sum, p) => sum + p.total_tasks, 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">مهام مكتملة</p>
              <p className="text-2xl font-bold text-success">
                {phases.reduce((sum, p) => sum + p.completed_tasks, 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">مهام متبقية</p>
              <p className="text-2xl font-bold text-warning">
                {phases.reduce((sum, p) => sum + (p.total_tasks - p.completed_tasks), 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">معدل الإنجاز</p>
              <p className="text-2xl font-bold text-primary">
                {phases.reduce((sum, p) => sum + p.total_tasks, 0) > 0
                  ? Math.round(
                      (phases.reduce((sum, p) => sum + p.completed_tasks, 0) /
                        phases.reduce((sum, p) => sum + p.total_tasks, 0)) *
                        100
                    )
                  : 0}
                %
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
