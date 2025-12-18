import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageErrorBoundary } from '@/components/shared/PageErrorBoundary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSupportTickets } from '@/hooks/support/useSupportTickets';
import { useSupportStats } from '@/hooks/support/useSupportStats';
import { TicketDetailsDialog } from '@/components/support/TicketDetailsDialog';
import { AgentPerformanceReport } from '@/components/support/AgentPerformanceReport';
import { AssignmentSettingsDialog } from '@/components/support/AssignmentSettingsDialog';
import { AgentAvailabilityCard } from '@/components/support/AgentAvailabilityCard';
import { EmptySupportState } from '@/components/support/EmptySupportState';
import { TicketCard } from '@/components/support/TicketCard';
import { DistributionList } from '@/components/support/DistributionBar';
import { SupportStatsCards } from '@/components/support/SupportStatsCards';
import { AlertCircle, Settings, Star } from 'lucide-react';
import { LoadingState } from '@/components/shared/LoadingState';
import type { SupportFilters } from '@/types/support';
import { Database } from '@/integrations/supabase/types';
import { cleanFilters } from '@/lib/utils/cleanFilters';

type SupportTicket = Database['public']['Tables']['support_tickets']['Row'];

type TicketWithRelations = SupportTicket & {
  beneficiary?: { full_name?: string };
  user?: { email?: string };
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

  const handleTicketClick = (id: string) => {
    setSelectedTicketId(id);
  };

  const getPriorityColor = (priority: string): 'primary' | 'destructive' | 'warning' | 'success' => {
    if (priority === 'عاجلة') return 'destructive';
    if (priority === 'عالية') return 'warning';
    return 'primary';
  };

  return (
    <PageErrorBoundary pageName="إدارة الدعم الفني">
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-end">
            <Button variant="outline" onClick={() => setSettingsOpen(true)}>
              <Settings className="h-4 w-4 ms-2" />
              <span className="hidden sm:inline">إعدادات التعيين</span>
            </Button>
          </div>
          
          <AgentAvailabilityCard />

          <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-2">
              <TabsList className="inline-flex w-max sm:w-full sm:grid sm:grid-cols-4 gap-1 h-auto min-w-full sm:min-w-0">
                <TabsTrigger value="overview" className="px-3 sm:px-4 py-2 whitespace-nowrap text-xs sm:text-sm">نظرة عامة</TabsTrigger>
                <TabsTrigger value="tickets" className="px-3 sm:px-4 py-2 whitespace-nowrap text-xs sm:text-sm">التذاكر</TabsTrigger>
                <TabsTrigger value="analytics" className="px-3 sm:px-4 py-2 whitespace-nowrap text-xs sm:text-sm">التحليلات</TabsTrigger>
                <TabsTrigger value="performance" className="px-3 sm:px-4 py-2 whitespace-nowrap text-xs sm:text-sm">الأداء</TabsTrigger>
              </TabsList>
            </div>

            {/* نظرة عامة */}
            <TabsContent value="overview" className="space-y-4 sm:space-y-6">
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
                  <SupportStatsCards stats={overviewStats} />

                  {/* التذاكر المتأخرة */}
                  {overdueTickets && overdueTickets.length > 0 && (
                    <Card className="border-destructive">
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-destructive" />
                          <CardTitle className="text-base sm:text-lg">
                            تذاكر متأخرة ({overdueTickets.length})
                          </CardTitle>
                        </div>
                        <CardDescription>
                          تذاكر تجاوزت وقت الاستجابة المحدد
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {overdueTickets.slice(0, 5).map((ticket) => (
                            <TicketCard
                              key={ticket.id}
                              id={ticket.id}
                              subject={ticket.subject}
                              ticketNumber={ticket.ticket_number || undefined}
                              status={ticket.status}
                              createdAt={ticket.created_at}
                              isOverdue
                              onClick={handleTicketClick}
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* التذاكر الأخيرة */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg">التذاكر الأخيرة</CardTitle>
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
                              <TicketCard
                                key={ticket.id}
                                id={ticket.id}
                                subject={ticket.subject}
                                beneficiaryName={ticketWithRelations.beneficiary?.full_name}
                                userEmail={ticketWithRelations.user?.email}
                                status={ticket.status}
                                createdAt={ticket.created_at}
                                onClick={handleTicketClick}
                              />
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
            <TabsContent value="tickets" className="space-y-4 sm:space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">جميع التذاكر</CardTitle>
                  <CardDescription>
                    قائمة شاملة بجميع تذاكر الدعم الفني
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* الفلاتر */}
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
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
                      <EmptySupportState />
                    ) : (
                      <div className="space-y-2">
                        {tickets.map((ticket) => {
                          const ticketWithRelations = ticket as TicketWithRelations;
                          return (
                            <TicketCard
                              key={ticket.id}
                              id={ticket.id}
                              subject={ticket.subject}
                              ticketNumber={ticket.ticket_number || undefined}
                              beneficiaryName={ticketWithRelations.beneficiary?.full_name}
                              userEmail={ticketWithRelations.user?.email}
                              status={ticket.status}
                              createdAt={ticket.created_at}
                              showTicketNumber
                              onClick={handleTicketClick}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* التحليلات */}
            <TabsContent value="analytics" className="space-y-4 sm:space-y-6">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {/* معدل الحل */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">معدل الحل</CardTitle>
                    <CardDescription>
                      نسبة التذاكر المحلولة من الإجمالي
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl sm:text-3xl font-bold">
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
                    <CardTitle className="text-base sm:text-lg">متوسط رضا العملاء</CardTitle>
                    <CardDescription>
                      من 5 نجوم
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl sm:text-3xl font-bold">
                        {overviewStats?.avgSatisfaction?.toFixed(1) || '0.0'}
                      </div>
                      <Star className="h-5 w-5 sm:h-6 sm:w-6 text-warning fill-warning" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* توزيع التذاكر حسب الفئة */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">توزيع التذاكر حسب الفئة</CardTitle>
                  <CardDescription>
                    عدد التذاكر في كل فئة
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DistributionList
                    data={overviewStats?.ticketsByCategory || {}}
                    emptyMessage="لا توجد بيانات"
                  />
                </CardContent>
              </Card>

              {/* توزيع التذاكر حسب الأولوية */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">توزيع التذاكر حسب الأولوية</CardTitle>
                  <CardDescription>
                    عدد التذاكر في كل مستوى أولوية
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DistributionList
                    data={overviewStats?.ticketsByPriority || {}}
                    getColor={getPriorityColor}
                    emptyMessage="لا توجد بيانات"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* تبويب أداء الموظفين */}
            <TabsContent value="performance" className="space-y-4 sm:space-y-6">
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
    </PageErrorBoundary>
  );
}
