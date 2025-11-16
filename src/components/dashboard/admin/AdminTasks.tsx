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
      <CardHeader className="pb-2 sm:pb-3 md:pb-4">
        <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base md:text-lg">
          <CheckSquare className="h-4 w-4 sm:h-5 sm:w-5" />
          المهام المعلقة
          <Badge variant="secondary" className="mr-auto text-[10px] sm:text-xs">
            {tasks.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 sm:space-y-3">
          {tasks.map((task, index) => (
            <div
              key={task.id}
              className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
            >
              {task.priority === "عالية" ? (
                <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-destructive flex-shrink-0" />
              ) : (
                <CheckSquare className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs md:text-sm font-medium text-foreground mb-0.5 sm:mb-1 line-clamp-2">
                  {task.task}
                </p>
                <Badge className={`${getPriorityBadgeClasses(task.priority)} text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0 sm:py-0.5`}>
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
