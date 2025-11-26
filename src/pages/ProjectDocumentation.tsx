import { useState } from "react";
import { useProjectDocumentation } from "@/hooks/useProjectDocumentation";
import { MobileOptimizedLayout } from "@/components/layout/MobileOptimizedLayout";
import { PhaseCard } from "@/components/documentation/PhaseCard";
import { PhaseFilter } from "@/components/documentation/PhaseFilter";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function ProjectDocumentation() {
  const [activeCategory, setActiveCategory] = useState("all");
  const { data: phases, isLoading, isError } = useProjectDocumentation(activeCategory);

  const getCounts = () => {
    if (!phases) return { all: 0, core: 0, design: 0, testing: 0, future: 0 };

    return {
      all: phases.length,
      core: phases.filter((p) => p.category === "core").length,
      design: phases.filter((p) => p.category === "design").length,
      testing: phases.filter((p) => p.category === "testing").length,
      future: phases.filter((p) => p.category === "future").length,
    };
  };

  const getCompletionStats = () => {
    if (!phases || phases.length === 0) return { completed: 0, inProgress: 0, planned: 0 };

    return {
      completed: phases.filter((p) => p.status === "completed").length,
      inProgress: phases.filter((p) => p.status === "in_progress").length,
      planned: phases.filter((p) => p.status === "planned").length,
    };
  };

  const stats = getCompletionStats();
  const totalProgress =
    phases && phases.length > 0
      ? Math.round(
          phases.reduce((sum, p) => sum + p.completion_percentage, 0) / phases.length
        )
      : 0;

  return (
    <MobileOptimizedLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">توثيق المشروع</h1>
            <p className="text-muted-foreground">نظام التوثيق التفاعلي لمراحل المشروع</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-emerald-500/20">
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
              {totalProgress}%
            </div>
            <div className="text-sm text-muted-foreground">إجمالي التقدم</div>
          </div>

          <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20">
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
              {stats.completed}
            </div>
            <div className="text-sm text-muted-foreground">مراحل مكتملة</div>
          </div>

          <div className="p-4 rounded-lg bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-500/20">
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">
              {stats.inProgress}
            </div>
            <div className="text-sm text-muted-foreground">قيد التنفيذ</div>
          </div>

          <div className="p-4 rounded-lg bg-gradient-to-br from-gray-500/10 to-gray-600/10 border border-gray-500/20">
            <div className="text-2xl font-bold text-gray-700 dark:text-gray-400">
              {stats.planned}
            </div>
            <div className="text-sm text-muted-foreground">مخططة</div>
          </div>
        </div>

        {/* Category Filter */}
        <PhaseFilter
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          counts={getCounts()}
        />

        {/* Phases Grid */}
        {isError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              حدث خطأ في تحميل بيانات التوثيق. يرجى المحاولة مرة أخرى.
            </AlertDescription>
          </Alert>
        ) : isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-[300px] w-full" />
              </div>
            ))}
          </div>
        ) : phases && phases.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {phases.map((phase) => (
              <PhaseCard key={phase.id} phase={phase} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">لا توجد مراحل</h3>
            <p className="text-muted-foreground mb-6">
              لم يتم العثور على مراحل في هذه الفئة
            </p>
          </div>
        )}
      </div>
    </MobileOptimizedLayout>
  );
}
