import { useMemo, useCallback, useState, useEffect } from "react";
import { Building2, Users, Wallet, FileText, AlertCircle, UsersRound, ClipboardList, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FinancialStats from "@/components/dashboard/FinancialStats";
import RevenueExpenseChart from "@/components/dashboard/RevenueExpenseChart";
import AccountDistributionChart from "@/components/dashboard/AccountDistributionChart";
import BudgetComparisonChart from "@/components/dashboard/BudgetComparisonChart";
import AccountingStats from "@/components/dashboard/AccountingStats";
import RecentJournalEntries from "@/components/dashboard/RecentJournalEntries";
import FamiliesStats from "@/components/dashboard/FamiliesStats";
import RequestsStats from "@/components/dashboard/RequestsStats";
import { useActivities } from "@/hooks/useActivities";
import { useTasks } from "@/hooks/useTasks";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { useUserRole } from "@/hooks/useUserRole";
import { Navigate, useNavigate } from "react-router-dom";
import BeneficiaryDialog from "@/components/beneficiaries/BeneficiaryDialog";
import { PropertyDialog } from "@/components/properties/PropertyDialog";
import { DistributionDialog } from "@/components/funds/DistributionDialog";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Dialogs State
  const [isBeneficiaryDialogOpen, setIsBeneficiaryDialogOpen] = useState(false);
  const [isPropertyDialogOpen, setIsPropertyDialogOpen] = useState(false);
  const [isDistributionDialogOpen, setIsDistributionDialogOpen] = useState(false);
  
  // ALL HOOKS MUST BE CALLED FIRST - Before any conditional returns
  const { isBeneficiary, isAccountant, isNazer, isCashier, isArchivist, isLoading: roleLoading } = useUserRole();
  const { activities, isLoading: activitiesLoading } = useActivities();
  const { tasks, isLoading: tasksLoading } = useTasks();
  const queryClient = useQueryClient();
  
  // Real-time subscriptions for activities and tasks
  useEffect(() => {
    const activitiesChannel = supabase
      .channel('activities-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'activities'
      }, () => {
        queryClient.invalidateQueries({ queryKey: ["activities"] });
      })
      .subscribe();
      
    const tasksChannel = supabase
      .channel('tasks-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks'
      }, () => {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(activitiesChannel);
      supabase.removeChannel(tasksChannel);
    };
  }, [queryClient]);

  const getPriorityBadgeClasses = useCallback((priority: string) => {
    if (priority === "عالية") {
      return "bg-destructive/15 text-destructive border border-destructive/30";
    }
    if (priority === "متوسطة") {
      return "bg-warning/15 text-warning border border-warning/30";
    }
    return "bg-muted text-muted-foreground border border-border";
  }, []);

  // التوجيه حسب الدور - استخدام useEffect لتجنب تحديث الـstate أثناء الـrender
  useEffect(() => {
    if (isBeneficiary) {
      navigate("/beneficiary-dashboard", { replace: true });
    } else if (isAccountant) {
      navigate("/accountant-dashboard", { replace: true });
    } else if (isNazer) {
      navigate("/nazer-dashboard", { replace: true });
    } else if (isCashier) {
      navigate("/cashier-dashboard", { replace: true });
    } else if (isArchivist) {
      navigate("/archivist-dashboard", { replace: true });
    }
  }, [isBeneficiary, isAccountant, isNazer, isCashier, isArchivist, navigate]);

  // NOW we can do conditional returns after all hooks are called
  if (roleLoading || activitiesLoading || tasksLoading) {
    return <LoadingState message="جاري تحميل لوحة التحكم..." />;
  }

  return (
    <div className="min-h-screen bg-background px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6 lg:px-8 lg:py-8">
      <div className="container mx-auto max-w-7xl space-y-4 sm:space-y-5 md:space-y-6">
        {/* Header */}
        <header className="space-y-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gradient-primary">
            لوحة التحكم الرئيسية
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
            نظرة شاملة على جميع أنشطة النظام
          </p>
        </header>

        {/* Stats Grid */}
        <div className="grid gap-3 sm:gap-4 md:gap-5 lg:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          <FinancialStats />
          <FamiliesStats />
          <RequestsStats />
          <AccountingStats />
        </div>

        {/* Charts Grid */}
        <div className="grid gap-3 sm:gap-4 md:gap-5 lg:gap-6 grid-cols-1 lg:grid-cols-2">
          <RevenueExpenseChart />
          <AccountDistributionChart />
        </div>

        <div className="grid gap-3 sm:gap-4 md:gap-5 lg:gap-6 grid-cols-1 lg:grid-cols-2">
          <BudgetComparisonChart />
          <RecentJournalEntries />
        </div>

        {/* Activity & Tasks Grid */}
        <div className="grid gap-3 sm:gap-4 md:gap-5 lg:gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Recent Activities */}
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                الأنشطة الأخيرة
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {activities.slice(0, 5).map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-200"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium line-clamp-2">{activity.action}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                          {activity.user_name} • {new Date(activity.timestamp).toLocaleString('ar-SA', { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={AlertCircle}
                  title="لا توجد أنشطة"
                  description="سيتم عرض الأنشطة الأخيرة هنا"
                />
              )}
            </CardContent>
          </Card>

          {/* Pending Tasks */}
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <ClipboardList className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                المهام المعلقة
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tasks.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-200"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium line-clamp-2">{task.task}</p>
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
                          <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs rounded-full ${getPriorityBadgeClasses(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={AlertCircle}
                  title="لا توجد مهام"
                  description="ستظهر هنا المهام المعلقة التي تحتاج إلى إجراء"
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              إجراءات سريعة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
              <Button
                variant="outline"
                className="h-auto py-3 sm:py-4 px-2 sm:px-3 flex-col gap-1.5 sm:gap-2 hover:bg-primary/5 hover:border-primary transition-all duration-200"
                onClick={() => setIsBeneficiaryDialogOpen(true)}
              >
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <span className="text-[10px] sm:text-xs">إضافة مستفيد</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-3 sm:py-4 px-2 sm:px-3 flex-col gap-1.5 sm:gap-2 hover:bg-primary/5 hover:border-primary transition-all duration-200"
                onClick={() => navigate("/families")}
              >
                <UsersRound className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <span className="text-[10px] sm:text-xs">إدارة العائلات</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-3 sm:py-4 px-2 sm:px-3 flex-col gap-1.5 sm:gap-2 hover:bg-primary/5 hover:border-primary transition-all duration-200"
                onClick={() => navigate("/requests")}
              >
                <ClipboardList className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <span className="text-[10px] sm:text-xs">الطلبات</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-3 sm:py-4 px-2 sm:px-3 flex-col gap-1.5 sm:gap-2 hover:bg-primary/5 hover:border-primary transition-all duration-200"
                onClick={() => setIsPropertyDialogOpen(true)}
              >
                <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <span className="text-[10px] sm:text-xs">إضافة عقار</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-3 sm:py-4 px-2 sm:px-3 flex-col gap-1.5 sm:gap-2 hover:bg-primary/5 hover:border-primary transition-all duration-200"
                onClick={() => setIsDistributionDialogOpen(true)}
              >
                <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <span className="text-[10px] sm:text-xs">توزيع غلة</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-3 sm:py-4 px-2 sm:px-3 flex-col gap-1.5 sm:gap-2 hover:bg-primary/5 hover:border-primary transition-all duration-200"
                onClick={() => navigate("/reports")}
              >
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <span className="text-[10px] sm:text-xs">التقارير</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <BeneficiaryDialog
        open={isBeneficiaryDialogOpen}
        onOpenChange={setIsBeneficiaryDialogOpen}
        onSave={() => setIsBeneficiaryDialogOpen(false)}
      />
      
      <PropertyDialog
        open={isPropertyDialogOpen}
        onOpenChange={setIsPropertyDialogOpen}
        onSave={() => setIsPropertyDialogOpen(false)}
      />
      
      <DistributionDialog
        open={isDistributionDialogOpen}
        onOpenChange={setIsDistributionDialogOpen}
        onDistribute={() => setIsDistributionDialogOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
