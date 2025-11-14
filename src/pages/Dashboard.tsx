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

  // NOW we can do conditional returns after all hooks are called
  if (roleLoading || activitiesLoading || tasksLoading) {
    return <LoadingState message="جاري تحميل لوحة التحكم..." />;
  }

  // التوجيه حسب الدور
  if (isBeneficiary) {
    return <Navigate to="/beneficiary-dashboard" replace />;
  }

  if (isAccountant) {
    return <Navigate to="/accountant-dashboard" replace />;
  }

  if (isNazer) {
    return <Navigate to="/nazer-dashboard" replace />;
  }

  if (isCashier) {
    return <Navigate to="/cashier-dashboard" replace />;
  }

  if (isArchivist) {
    return <Navigate to="/archivist-dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6 md:space-y-8">
        {/* Header */}
        <header className="space-y-1 sm:space-y-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gradient-primary break-words">
            لوحة التحكم الرئيسية
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
            مرحباً بك في منصة إدارة الوقف الإلكترونية
          </p>
        </header>

        {/* Financial Stats */}
        <FinancialStats />

        {/* Families Stats */}
        <FamiliesStats />

        {/* Requests Stats */}
        <RequestsStats />

        {/* Accounting Stats */}
        <AccountingStats />

        {/* Revenue & Expense Chart */}
        <RevenueExpenseChart />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          <AccountDistributionChart />
          <BudgetComparisonChart />
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {/* Recent Journal Entries */}
          <RecentJournalEntries />

          {/* Recent Activities */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-xl font-bold">النشاطات الأخيرة</CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="لا توجد نشاطات"
                  description="ستظهر هنا أحدث النشاطات في النظام"
                  className="py-8"
                />
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 pb-4 border-b border-border last:border-0 last:pb-0"
                    >
                      <div className="p-2 bg-primary/10 rounded-full">
                        <div className="h-2 w-2 bg-primary rounded-full"></div>
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium text-foreground">
                          {activity.action}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          بواسطة {activity.user_name}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(activity.timestamp).toLocaleDateString("ar-SA")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Tasks */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-xl font-bold">المهام المعلقة</CardTitle>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <EmptyState
                  icon={AlertCircle}
                  title="لا توجد مهام"
                  description="ستظهر هنا المهام المعلقة التي تحتاج إلى إجراء"
                  className="py-8"
                />
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-4 pb-4 border-b border-border last:border-0 last:pb-0"
                    >
                      <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium text-foreground">
                          {task.task}
                        </p>
                        <span
                          className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${getPriorityBadgeClasses(task.priority)}`}
                        >
                          الأولوية: {task.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="shadow-soft bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl font-bold">الإجراءات السريعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
              <Button
                onClick={() => setIsBeneficiaryDialogOpen(true)}
                variant="outline"
                className="group h-auto p-3 md:p-4 bg-card hover:bg-primary rounded-lg shadow-soft hover:shadow-medium transition-all duration-300 text-right border border-transparent hover:border-primary flex flex-col items-start"
              >
                <Users className="h-5 w-5 md:h-6 md:w-6 mb-2 text-primary group-hover:text-primary-foreground transition-colors" />
                <span className="font-medium text-xs md:text-sm text-foreground group-hover:text-primary-foreground transition-colors">إضافة مستفيد</span>
              </Button>
              
              <Button
                onClick={() => navigate('/families')}
                variant="outline"
                className="group h-auto p-3 md:p-4 bg-card hover:bg-primary rounded-lg shadow-soft hover:shadow-medium transition-all duration-300 text-right border border-transparent hover:border-primary flex flex-col items-start"
              >
                <UsersRound className="h-5 w-5 md:h-6 md:w-6 mb-2 text-primary group-hover:text-primary-foreground transition-colors" />
                <span className="font-medium text-xs md:text-sm text-foreground group-hover:text-primary-foreground transition-colors">إدارة العائلات</span>
              </Button>

              <Button
                onClick={() => navigate('/requests')}
                variant="outline"
                className="group h-auto p-3 md:p-4 bg-card hover:bg-primary rounded-lg shadow-soft hover:shadow-medium transition-all duration-300 text-right border border-transparent hover:border-primary flex flex-col items-start"
              >
                <ClipboardList className="h-5 w-5 md:h-6 md:w-6 mb-2 text-primary group-hover:text-primary-foreground transition-colors" />
                <span className="font-medium text-xs md:text-sm text-foreground group-hover:text-primary-foreground transition-colors">عرض الطلبات</span>
              </Button>
              
              <Button
                onClick={() => setIsPropertyDialogOpen(true)}
                variant="outline"
                className="group h-auto p-3 md:p-4 bg-card hover:bg-primary rounded-lg shadow-soft hover:shadow-medium transition-all duration-300 text-right border border-transparent hover:border-primary flex flex-col items-start"
              >
                <Building2 className="h-5 w-5 md:h-6 md:w-6 mb-2 text-primary group-hover:text-primary-foreground transition-colors" />
                <span className="font-medium text-xs md:text-sm text-foreground group-hover:text-primary-foreground transition-colors">إضافة عقار</span>
              </Button>
              
              <Button
                onClick={() => setIsDistributionDialogOpen(true)}
                variant="outline"
                className="group h-auto p-3 md:p-4 bg-card hover:bg-primary rounded-lg shadow-soft hover:shadow-medium transition-all duration-300 text-right border border-transparent hover:border-primary flex flex-col items-start"
              >
                <Wallet className="h-5 w-5 md:h-6 md:w-6 mb-2 text-primary group-hover:text-primary-foreground transition-colors" />
                <span className="font-medium text-xs md:text-sm text-foreground group-hover:text-primary-foreground transition-colors">توزيع الغلة</span>
              </Button>
              
              <Button
                onClick={() => navigate('/reports')}
                variant="outline"
                className="group h-auto p-3 md:p-4 bg-card hover:bg-primary rounded-lg shadow-soft hover:shadow-medium transition-all duration-300 text-right border border-transparent hover:border-primary flex flex-col items-start"
              >
                <FileText className="h-5 w-5 md:h-6 md:w-6 mb-2 text-primary group-hover:text-primary-foreground transition-colors" />
                <span className="font-medium text-xs md:text-sm text-foreground group-hover:text-primary-foreground transition-colors">إنشاء تقرير</span>
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
