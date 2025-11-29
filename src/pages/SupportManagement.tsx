import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageErrorBoundary } from '@/components/shared/PageErrorBoundary';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSupportTickets } from '@/hooks/useSupportTickets';
import { useSupportStats } from '@/hooks/useSupportStats';
import { TicketDetailsDialog } from '@/components/support/TicketDetailsDialog';
import { AgentPerformanceReport } from '@/components/support/AgentPerformanceReport';
import { AssignmentSettingsDialog } from '@/components/support/AssignmentSettingsDialog';
import { AgentAvailabilityCard } from '@/components/support/AgentAvailabilityCard';
import { EmptySupportState } from '@/components/support/EmptySupportState';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Users,
  Star,
  Settings,
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { LoadingState } from '@/components/shared/LoadingState';
import type { SupportFilters } from '@/types/support';
import { Database } from '@/integrations/supabase/types';
import { cleanFilters } from '@/lib/utils/cleanFilters';

type SupportTicket = Database['public']['Tables']['support_tickets']['Row'];

type TicketWithRelations = SupportTicket & {
  beneficiary?: { full_name?: string };
  user?: { email?: string };
};

const statusLabels = {
  open: 'مفتوحة',
  in_progress: 'قيد المعالجة',
  waiting_customer: 'بانتظار العميل',
  resolved: 'تم الحل',
  closed: 'مغلقة',
  cancelled: 'ملغية',
};

export default function SupportManagement() {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [filters, setFilters] = useState<SupportFilters>({});
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { tickets, isLoading } = useSupportTickets(cleanFilters(filters));
  const { 
    overviewStats, 
    overdueTickets, 
    recentTickets, 
    overviewLoading,
    overviewError 
  } = useSupportStats();

  const handleFilterChange = (key: keyof SupportFilters, value: string | string[] | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <PageErrorBoundary pageName="إدارة الدعم الفني">
      <MainLayout>
        <div className="space-y-6">
        <div className="flex items-center justify-end">
          <Button variant="outline" onClick={() => setSettingsOpen(true)}>
            <Settings className="h-4 w-4 ml-2" />
            إعدادات التعيين
          </Button>
        </div>
        
        <AgentAvailabilityCard />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="tickets">جميع التذاكر</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
          <TabsTrigger value="performance">أداء الموظفين</TabsTrigger>
        </TabsList>

        {/* نظرة عامة */}
        <TabsContent value="overview" className="space-y-6">
          {overviewLoading ? (
            <LoadingState message="جاري تحميل الإحصائيات..." />
          ) : overviewError ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">خطأ في تحميل البيانات</h3>
                  <p className="text-muted-foreground">حدث خطأ أثناء تحميل إحصائيات الدعم الفني</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => window.location.reload()}
                  >
                    إعادة المحاولة
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* بطاقات الإحصائيات */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      التذاكر المفتوحة
                    </CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {overviewStats?.ticketsByStatus?.open || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      بحاجة للمراجعة
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      قيد المعالجة
                    </CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {overviewStats?.ticketsByStatus?.in_progress || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      جاري العمل عليها
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      تم الحل
                    </CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {overviewStats?.ticketsByStatus?.resolved || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      بانتظار الإغلاق
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      معدل الرضا
                    </CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {overviewStats?.avgSatisfaction ? 
                        overviewStats.avgSatisfaction.toFixed(1) : '0.0'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      من 5.0 ({overviewStats?.totalRatings || 0} تقييم)
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* التذاكر المتأخرة */}
              {overdueTickets && overdueTickets.length > 0 && (
                <Card className="border-destructive">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                      <CardTitle>تذاكر متأخرة ({overdueTickets.length})</CardTitle>
                    </div>
                    <CardDescription>
                      تذاكر تجاوزت وقت الاستجابة المحدد
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {overdueTickets.slice(0, 5).map((ticket) => (
                        <div
                          key={ticket.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted"
                          onClick={() => setSelectedTicketId(ticket.id)}
                        >
                          <div>
                            <p className="font-medium">{ticket.subject}</p>
                            <p className="text-sm text-muted-foreground">
                              #{ticket.ticket_number}
                            </p>
                          </div>
                          <Badge variant="destructive">متأخر</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* التذاكر الأخيرة */}
              <Card>
                <CardHeader>
                  <CardTitle>التذاكر الأخيرة</CardTitle>
                  <CardDescription>
                    آخر التذاكر المُنشأة
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {recentTickets && recentTickets.length > 0 ? (
                      recentTickets.slice(0, 5).map((ticket) => {
                        const ticketWithRelations = ticket as TicketWithRelations;
                        return (
                          <div
                            key={ticket.id}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted"
                            onClick={() => setSelectedTicketId(ticket.id)}
                          >
                            <div className="flex-1">
                              <p className="font-medium">{ticket.subject}</p>
                              <p className="text-sm text-muted-foreground">
                                {ticketWithRelations.beneficiary?.full_name || ticketWithRelations.user?.email}
                              </p>
                            </div>
                            <div className="text-left space-y-2">
                              <Badge>
                                {statusLabels[ticket.status as keyof typeof statusLabels]}
                              </Badge>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(ticket.created_at), 'PP', { locale: ar })}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">لا توجد تذاكر</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* جميع التذاكر */}
        <TabsContent value="tickets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>جميع التذاكر</CardTitle>
              <CardDescription>
                قائمة شاملة بجميع تذاكر الدعم الفني
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* الفلاتر */}
                <div className="grid gap-4 md:grid-cols-4">
                  <Input
                    placeholder="البحث..."
                    value={filters.search || ''}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                  <Select
                    value={filters.status?.[0] || 'all'}
                    onValueChange={(value) => 
                      handleFilterChange('status', value === 'all' ? [] : [value])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">الكل</SelectItem>
                      <SelectItem value="open">مفتوحة</SelectItem>
                      <SelectItem value="in_progress">قيد المعالجة</SelectItem>
                      <SelectItem value="resolved">تم الحل</SelectItem>
                      <SelectItem value="closed">مغلقة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* قائمة التذاكر */}
                  {isLoading ? (
                    <LoadingState message="جاري تحميل التذاكر..." />
                  ) : !tickets || tickets.length === 0 ? (
                    <EmptySupportState onRefresh={handleRefresh} />
                  ) : (
                    <div className="space-y-2">
                      {tickets.map((ticket) => {
                        const ticketWithRelations = ticket as TicketWithRelations;
                        return (
                          <div
                            key={ticket.id}
                            className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50"
                            onClick={() => setSelectedTicketId(ticket.id)}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                              <p className="font-medium">{ticket.subject}</p>
                                <Badge variant="outline">#{ticket.ticket_number}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {ticketWithRelations.beneficiary?.full_name || ticketWithRelations.user?.email}
                              </p>
                            </div>
                            <div className="text-left space-y-2">
                              <Badge>
                                {statusLabels[ticket.status as keyof typeof statusLabels]}
                              </Badge>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(ticket.created_at), 'PP', { locale: ar })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* التحليلات */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* معدل الحل */}
            <Card>
              <CardHeader>
                <CardTitle>معدل الحل</CardTitle>
                <CardDescription>
                  نسبة التذاكر المحلولة من الإجمالي
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-bold">
                    {overviewStats?.ticketsByStatus ? 
                      (() => {
                        const resolved = Number(overviewStats.ticketsByStatus.resolved || 0);
                        const closed = Number(overviewStats.ticketsByStatus.closed || 0);
                        const total = Object.values(overviewStats.ticketsByStatus).reduce((a, b) => Number(a) + Number(b), 0);
                        return Number(total) > 0 ? `${Math.round(((resolved + closed) / Number(total)) * 100)}%` : '0%';
                      })() : 
                      '0%'}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* متوسط التقييم */}
            <Card>
              <CardHeader>
                <CardTitle>متوسط رضا العملاء</CardTitle>
                <CardDescription>
                  من 5 نجوم
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-bold">
                    {overviewStats?.avgSatisfaction ? 
                      overviewStats.avgSatisfaction.toFixed(1) : 
                      '0.0'}
                  </div>
                  <Star className="h-6 w-6 text-warning fill-warning" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* توزيع التذاكر حسب الفئة */}
          <Card>
            <CardHeader>
              <CardTitle>توزيع التذاكر حسب الفئة</CardTitle>
              <CardDescription>
                عدد التذاكر في كل فئة
              </CardDescription>
            </CardHeader>
            <CardContent>
              {overviewStats?.ticketsByCategory ? (
                <div className="space-y-3">
                  {Object.entries(overviewStats.ticketsByCategory).map(([category, count]) => {
                    const maxCount = Math.max(...Object.values(overviewStats.ticketsByCategory).map((v) => Number(v)));
                    const percentage = maxCount > 0 ? (Number(count) / maxCount) * 100 : 0;
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{category}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-8 text-left">
                            {count}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  لا توجد بيانات
                </p>
              )}
            </CardContent>
          </Card>

          {/* توزيع التذاكر حسب الأولوية */}
          <Card>
            <CardHeader>
              <CardTitle>توزيع التذاكر حسب الأولوية</CardTitle>
              <CardDescription>
                عدد التذاكر في كل مستوى أولوية
              </CardDescription>
            </CardHeader>
            <CardContent>
              {overviewStats?.ticketsByPriority ? (
                <div className="space-y-3">
                  {Object.entries(overviewStats.ticketsByPriority).map(([priority, count]) => {
                    const maxCount = Math.max(...Object.values(overviewStats.ticketsByPriority).map((v) => Number(v)));
                    const percentage = maxCount > 0 ? (Number(count) / maxCount) * 100 : 0;
                    return (
                      <div key={priority} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{priority}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-muted rounded-full h-2">
                            <div 
                              className="h-2 rounded-full"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: priority === 'عاجلة' ? 'hsl(var(--destructive))' : 
                                               priority === 'عالية' ? 'hsl(var(--warning))' : 
                                               'hsl(var(--primary))'
                              }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-8 text-left">
                            {count}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  لا توجد بيانات
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* تبويب أداء الموظفين */}
        <TabsContent value="performance" className="space-y-6">
          <AgentPerformanceReport />
        </TabsContent>
      </Tabs>

        <TicketDetailsDialog
          ticketId={selectedTicketId}
          open={!!selectedTicketId}
          onOpenChange={(open) => !open && setSelectedTicketId(null)}
        />

        <AssignmentSettingsDialog
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
        />
        </div>
      </MainLayout>
    </PageErrorBoundary>
  );
}
