import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTasks } from "@/hooks/useTasks";
import { CheckSquare, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

export const AdminTasks = () => {
  const { tasks, isLoading } = useTasks();

  const getPriorityBadgeClasses = (priority: string) => {
    if (priority === "عالية") {
      return "bg-destructive/15 text-destructive border border-destructive/30";
    }
    if (priority === "متوسطة") {
      return "bg-warning/15 text-warning border border-warning/30";
    }
    return "bg-muted text-muted-foreground border border-border";
  };

  if (isLoading) {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            المهام المعلقة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                <Skeleton className="h-4 w-4" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            المهام المعلقة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={CheckSquare}
            title="لا توجد مهام معلقة"
            description="رائع! لا توجد مهام تحتاج إلى إنجاز"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5" />
          المهام المعلقة
          <Badge variant="secondary" className="mr-auto">
            {tasks.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tasks.map((task, index) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {task.priority === "عالية" ? (
                <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
              ) : (
                <CheckSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground mb-1">
                  {task.task}
                </p>
                <Badge className={getPriorityBadgeClasses(task.priority)}>
                  {task.priority}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
