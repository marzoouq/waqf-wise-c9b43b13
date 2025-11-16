import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Users,
  Star,
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { LoadingState } from '@/components/shared/LoadingState';
import type { SupportFilters } from '@/types/support';

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

  const { tickets, isLoading } = useSupportTickets(filters);
  const { overviewStats, overdueTickets, recentTickets, overviewLoading } = useSupportStats();

  const handleFilterChange = (key: keyof SupportFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <MainLayout
      title="إدارة الدعم الفني"
      description="لوحة تحكم شاملة لإدارة التذاكر والدعم الفني"
    >
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="tickets">جميع التذاكر</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
        </TabsList>

        {/* نظرة عامة */}
        <TabsContent value="overview" className="space-y-6">
          {overviewLoading ? (
            <LoadingState message="جاري تحميل الإحصائيات..." />
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
                      {overdueTickets.slice(0, 5).map((ticket: any) => (
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
                      recentTickets.slice(0, 5).map((ticket: any) => (
                        <div
                          key={ticket.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted"
                          onClick={() => setSelectedTicketId(ticket.id)}
                        >
                          <div className="flex-1">
                            <p className="font-medium">{ticket.subject}</p>
                            <p className="text-sm text-muted-foreground">
                              {(ticket as any).beneficiary?.full_name || (ticket as any).user?.email}
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
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">لا توجد تذاكر</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* التحليلات */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>التحليلات والإحصائيات</CardTitle>
              <CardDescription>
                قريباً - تحليلات متقدمة لأداء الدعم الفني
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>

      <TicketDetailsDialog
        ticketId={selectedTicketId}
        open={!!selectedTicketId}
        onOpenChange={(open) => !open && setSelectedTicketId(null)}
      />
    </MainLayout>
  );
}
